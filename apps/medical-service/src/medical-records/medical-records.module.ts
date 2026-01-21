import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ClientsModule, Transport } from '@nestjs/microservices'; // 👈 Importar
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordSchema } from './entities/medical-record.schema';

@Module({
  imports: [
    // 1. DynamoDB Table
    DynamooseModule.forFeature([
      {
        name: 'MedicalRecord',
        schema: MedicalRecordSchema,
        options: { tableName: 'medical_records' },
      },
    ]),

    // 2. Kafka Client (Para notificar diagnósticos)
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'medical-record',
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
          },
          consumer: {
            groupId: 'medical-producer-group',
          },
        },
      },
    ]),
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}