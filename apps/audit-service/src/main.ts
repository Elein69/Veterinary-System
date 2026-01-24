import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Audit_Security_System');
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('audit'); 
 
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER]
      },
      consumer: {
        groupId: 'audit-consumer-group',
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Audit & Security Service')
    .setDescription('Historial inmutable de eventos del sistema (Logs en Postgres)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('audit/docs', app, document);

  await app.startAllMicroservices();
  await app.listen(3010);
  
  logger.log('🛡️  Audit Service running on:');
  logger.log('👉 HTTP (Docs): http://localhost:3010/docs');
  logger.log('👉 Kafka: Monitoring system event bus...');
}
bootstrap();