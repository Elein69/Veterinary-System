import { NestFactory } from '@nestjs/core';
import { StaffServiceModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Staff_Main');
  const app = await NestFactory.create(StaffServiceModule);
  
  app.setGlobalPrefix('staff');
  // 🔌 Conexión a RabbitMQ para validaciones síncronas
  // 🔌 Conexión a RabbitMQ para validaciones síncronas
  // 🔌 Conexión a RabbitMQ
  // Si existe la variable de entorno (AWS), la usa. Si no, usa la local (Tu PC).
  const rabbitUrl = process.env.RABBITMQ_HOST || 'amqp://guest:guest@localhost:5672';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl], 
      queue: 'staff_queue',
      queueOptions: { durable: false },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Staff Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();
  await app.listen(3009);
  logger.log('👨‍⚕️ Staff Service conectado a RabbitMQ y puerto 3009');
}
bootstrap();