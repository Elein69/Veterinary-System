import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <--- Importante
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelemetryModule } from './telemetry/telemetry.module'; // Tu módulo de telemetría
import { HealthController } from './health.controller';

@Module({
  imports: [
    // 👇 ESTO ES LO QUE ARREGLA EL "UNDEFINED"
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/iot-service/.env', 
    }),
    TelemetryModule, 
  ],
  controllers: [AppController, HealthController, ],
  providers: [AppService],
})
export class AppModule {}