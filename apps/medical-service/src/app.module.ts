import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { MedicalRecordsModule } from './medical-records/medical-records.module';

@Module({
  imports: [
    DynamooseModule.forRoot({
      local: 'http://127.0.0.1:8000', // 👈 Cambia el string por 'true' para activar modo local
      aws: { 
        region: 'us-east-1',
        accessKeyId: 'local',
        secretAccessKey: 'local',
      },
      table: {
        create: true,
        prefix: 'vet_',
        suffix: '-table',
      },
      // 👇 Agregamos esta línea para forzar el endpoint de localhost
    }),
    MedicalRecordsModule,
  ],
})
export class AppModule {}