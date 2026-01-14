import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { AppService } from './app.service';
import { TelemetryService } from './telemetry/telemetry.service'; // 👈 Importamos el servicio

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly telemetryService: TelemetryService, // 👈 Lo inyectamos
  ) {}

  @Get()
  getHello(): string {
    return '📡 IoT Service is Running (HTTP + MQTT + InfluxDB)';
  }

  // 👇 Escuchamos el tópico MQTT y guardamos en InfluxDB
  @MessagePattern('sensores/temperatura')
  async readTemperature(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    
    // Si los datos llegan como String JSON, los parseamos
    const payload = typeof data === 'string' ? JSON.parse(data) : data;

    console.log(`🌡️ [MQTT] Dato recibido en ${topic}:`, payload);

    // Guardamos en InfluxDB usando tu servicio
    await this.telemetryService.create({
      patientId: payload.patientId || 'unknown-pet',
      temperature: parseFloat(payload.temperature),
      heartRate: parseInt(payload.heartRate || '0'),
    });
    
    console.log('✅ Dato persistido en InfluxDB');
  }
}