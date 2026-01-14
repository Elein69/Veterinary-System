import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Audit_Security_System');
  
  // 1. Creamos una aplicación híbrida (HTTP + Kafka)
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // 2. Conectamos Kafka para seguir auditando eventos en segundo plano
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['127.0.0.1:9092'],
      },
      consumer: {
        groupId: 'audit-consumer-group',
      },
    },
  });

  // 3. Swagger para poder consultar los logs de auditoría vía Web
  const config = new DocumentBuilder()
    .setTitle('Audit & Security Service')
    .setDescription('Historial inmutable de eventos del sistema (Logs en Postgres)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 4. Arrancamos ambos mundos
  await app.startAllMicroservices();
  await app.listen(3010);
  
  logger.log('🛡️  Audit Service running on:');
  logger.log('👉 HTTP (Docs): http://localhost:3010/docs');
  logger.log('👉 Kafka: Monitoring system event bus...');
}
bootstrap();