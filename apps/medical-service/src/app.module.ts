import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { HealthController } from './health.controller';


@Module({
  imports: [
    DynamooseModule.forRootAsync({
  useFactory: () => ({
    aws: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    local: process.env.DYNAMODB_ENDPOINT,
    table: {
      create: true,
      prefix: 'vet_',
      suffix: '-table',
    },
  }),
})
,
    MedicalRecordsModule,
  ],
  controllers: [
    HealthController, // ✅ ahora sí existe
  ],
})
export class AppModule {}