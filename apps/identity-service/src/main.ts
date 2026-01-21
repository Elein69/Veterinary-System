import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // 1. Crear la aplicación híbrida (HTTP + Microservicio)
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // 2. Conectar el Microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL || 'amqp://guest:guest@vet_rabbitmq:5672'], // URL de tu contenedor RabbitMQ
      queue: 'identity_queue',         // 👈 Debe coincidir con lo que pusiste en Appointment Service
      queueOptions: {
        durable: false
      },
    },
  });

  // 3. Configurar Swagger (Documentación)
  const config = new DocumentBuilder()
    .setTitle('Identity Service')
    .setDescription('Authentication via HTTP & RabbitMQ')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 4. Iniciar todo
  await app.startAllMicroservices(); // Inicia RabbitMQ
  await app.listen(3001);            // Inicia HTTP en puerto 3001
  console.log('🐰 Identity Service escuchando en RabbitMQ (identity_queue) y HTTP:3001');
}
bootstrap();