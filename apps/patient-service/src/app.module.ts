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
    DynamooseModule.forRoot({
      local: 'http://127.0.0.1:8000', 
      aws: { region: 'us-east-1' },
      table: {
        create: true,
        prefix: 'vet_',
        suffix: '-table',
      },
    }),

    // 3. Módulo de lógica de negocio
    PatientsModule, 
  ],
})
export class AppModule {}