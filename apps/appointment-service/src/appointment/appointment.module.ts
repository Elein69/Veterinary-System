import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 Importar
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity'; // 👈 Importar Entidad

@Module({
  imports: [
    // 1. Registrar Entidad para Base de Datos
    TypeOrmModule.forFeature([Appointment]), 

    // 2. Clientes de Mensajería (Tu código original estaba bien aquí)
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'identity_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'BILLING_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'appointment',
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'appointment-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}