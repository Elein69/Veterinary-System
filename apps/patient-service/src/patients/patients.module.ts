import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientSchema } from './schemas/patient.schema';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'Patient',
        schema: PatientSchema,
      },
    ]),
   ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          // 👇 CAMBIO: Usamos 127.0.0.1 en lugar de localhost
          client: { brokers: [process.env.KAFKA_BROKER || 'kafka:9092'] }, 
          consumer: { groupId: 'patient-consumer' },
        },
      },
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}