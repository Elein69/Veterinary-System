import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      // 👇 CAMBIO AQUÍ: Usa 127.0.0.1 en vez de localhost
      url: `mqtt://${process.env.MQTT_HOST || 'localhost'}:1883`,
    },
  });

  app.setGlobalPrefix('iot');
  const config = new DocumentBuilder()
    .setTitle('IoT Service')
    .setDescription('Recibe datos de sensores vía MQTT')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 4. Arrancamos todo
  await app.startAllMicroservices();
  await app.listen(3004);
  console.log('📡 IoT Service escuchando en:');
  console.log('   - HTTP: http://localhost:3004/docs');
  console.log('   - MQTT: localhost:1883 (Tópico: sensores/temperatura)');
}
bootstrap();