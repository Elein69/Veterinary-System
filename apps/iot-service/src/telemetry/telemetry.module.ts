import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <--- 1. Importar esto
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';

@Module({
  imports: [ConfigModule], // <--- 2. Agregar esto aquí
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}