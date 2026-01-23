import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('iot');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      
      url: `mqtt://${process.env.MQTT_HOST || 'localhost'}:1883`,
    },
  });

  
  const config = new DocumentBuilder()
    .setTitle('IoT Service')
    .setDescription('Recibe datos de sensores vía MQTT')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('iot/docs', app, document);

  // 4. Arrancamos todo
  await app.startAllMicroservices();
  await app.listen(3004);
  console.log('📡 IoT Service escuchando en:');
  console.log('   - HTTP: http://localhost:3004/docs');
  console.log('   - MQTT: localhost:1883 (Tópico: sensores/temperatura)');
}
bootstrap();