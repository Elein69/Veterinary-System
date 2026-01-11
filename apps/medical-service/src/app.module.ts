import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { MedicalRecordsModule } from './medical-records/medical-records.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamooseModule.forRoot({
      local: 'http://localhost:8000', // FIX: Pass URL string directly here
      aws: {
        region: 'us-east-1',
        accessKeyId: 'local',
        secretAccessKey: 'local',
      },
      table: {
        create: true,
        prefix: '',
        suffix: '',
      },
    }),
    MedicalRecordsModule,
  ],
})
export class AppModule {}