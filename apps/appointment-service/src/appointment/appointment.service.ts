import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy, // RabbitMQ
    @Inject('BILLING_SERVICE') private billingClient: ClientProxy,   // Kafka
  ) {}

  // ---------------------------------------------------------
  // MÉTODO CREATE (Orquestación completa)
  // ---------------------------------------------------------
  async create(dto: CreateAppointmentDto) {
    this.logger.log('1. [Appointment] Solicitud recibida. Validando usuario...');

    // A. 🐰 Validación Síncrona (RabbitMQ)
    let isValidUser = false;
    try {
       // Enviamos mensaje a Identity y esperamos respuesta
       const response = await lastValueFrom(
         this.identityClient.send('validate_user', { userId: dto.patientId })
       );
       isValidUser = response; 
       this.logger.log(`2. ✅ Identity Respondió: ${response}`);
    } catch (e) {
       this.logger.error('❌ Error contactando Identity Service', e);
       // En un entorno real, aquí podrías lanzar una excepción o marcar status: ERROR
    }

    // B. 💾 Guardar en PostgreSQL
    const newAppointment = this.appointmentRepository.create({
      ...dto,
      status: isValidUser ? 'CONFIRMED' : 'PENDING_VALIDATION',
    });
    
    const savedAppointment = await this.appointmentRepository.save(newAppointment);

    // C. 💰 Notificación Asíncrona (Kafka)
    this.logger.log('3. [Appointment] Emitiendo evento a Facturación...');
    
    this.billingClient.emit('crear_factura', {
      appointmentId: savedAppointment.id,
      patientId: dto.patientId,
      amount: 100, // Precio base de ejemplo
      currency: 'USD'
    });

    return savedAppointment;
  }

  // ---------------------------------------------------------
  // MÉTODO FINDALL (Con Filtros)
  // ---------------------------------------------------------
  async findAll(filters: { patientId?: string; doctorId?: string; status?: string }) {
    this.logger.log('🔎 Buscando citas con filtros:', filters);
    
    return this.appointmentRepository.find({
      where: {
        // Si el valor es undefined, TypeORM lo ignora automáticamente
        patientId: filters.patientId,
        doctorId: filters.doctorId,
        status: filters.status,
      },
      order: {
        date: 'DESC', // Ordenamos por fecha (las más recientes primero)
      }
    });
  }
}