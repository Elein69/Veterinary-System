import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  app.enableCors();

  app.setGlobalPrefix('notification');
  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('Centralized Notification Hub. Listens to Kafka events from all microservices.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 📡 Kafka Connection (Haciendo el puente con los otros servicios)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: [process.env.KAFKA_BROKER || 'kafka:9092'] },
      consumer: { groupId: 'notification-consumer' },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3008);
  console.log('📧 Notification Service running on Kafka + HTTP:3008/docs');
}
bootstrap();