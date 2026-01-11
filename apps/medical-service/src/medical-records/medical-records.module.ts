import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordSchema } from './entities/medical-record.schema';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'MedicalRecord',
        schema: MedicalRecordSchema,
        options: {
          tableName: 'medical_records', // Explicit table name in DynamoDB
        },
      },
    ]),
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}