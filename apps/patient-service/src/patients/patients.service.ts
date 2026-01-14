import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamoose';
import type { Model } from 'nestjs-dynamoose';
import { Patient, PatientKey } from './interfaces/patient.interface';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel('Patient')
    private readonly patientModel: Model<Patient, PatientKey>,
    
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientProxy,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    // 1. Guardar en DynamoDB (Mapeo explícito para evitar errores de tipo)
    const newPatient = await this.patientModel.create({
      id: uuidv4(),
      name: createPatientDto.name,
      species: createPatientDto.species,
      breed: createPatientDto.breed,
      ownerName: createPatientDto.ownerName,
      ownerEmail: createPatientDto.ownerEmail,
    });

    // 2. Notificar a través de Kafka (Event-Driven)
    // El evento 'patient_created' permitirá que otros servicios reaccionen
    this.kafkaClient.emit('patient_created', newPatient);
    
    return newPatient;
  }

  async findAll() {
    return this.patientModel.scan().exec();
  }

  async findOne(id: string) {
    const patient = await this.patientModel.get({ id });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async findByOwner(ownerEmail: string) {
    // IMPORTANTE: Para que esto funcione, ownerEmail debe ser un INDEX en el Schema
    return this.patientModel.query('ownerEmail').eq(ownerEmail).exec();
  }
}