// apps/identity-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // 2. Conectar el Microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      // 🚨 CORRECCIÓN IMPORTANTE:
      // 1. Usamos RABBITMQ_HOST (que viene de Terraform)
      // 2. Quitamos 'vet_rabbitmq' del fallback y ponemos 'localhost' por seguridad
      urls: [process.env.RABBITMQ_HOST || 'amqp://guest:guest@localhost:5672'], 
      queue: 'identity_queue',
      queueOptions: {
        durable: false
      },
    },
  });

  app.setGlobalPrefix('identity');
  const config = new DocumentBuilder()
    .setTitle('Identity Service')
    .setDescription('Authentication via HTTP & RabbitMQ')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('🐰 Identity Service escuchando en RabbitMQ y HTTP:3001');
}
bootstrap();