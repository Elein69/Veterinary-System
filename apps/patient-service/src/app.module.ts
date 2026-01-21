import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    // 1. Cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/patient-service/.env',
    }),

    // 2. Conexión a DynamoDB Local (NoSQL)
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
  }),


    // 3. Módulo de lógica de negocio
    PatientsModule, 
  ],
})
export class AppModule {}