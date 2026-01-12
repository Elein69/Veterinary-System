import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env', // <--- AGREGAMOS ESTO para obligarlo a leer el archivo local
    }),
    TelemetryModule,
  ],
})
export class AppModule {}