import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Inventory_Main');
  const app = await NestFactory.create(InventoryServiceModule);
  app.enableCors();
  app.setGlobalPrefix('inventory');
 
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
      },
      consumer: {
        groupId: 'inventory-consumer-server',
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Inventory Service')
    .setDescription('Reactive inventory management via Kafka')
    .setVersion('1.0')
    .addTag('Inventory')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('inventory/docs', app, document);

  // Arrancar microservicios y HTTP
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3007, '0.0.0.0');

  logger.log('📦 Inventory Service corriendo en HTTP y escuchando Kafka');
}

bootstrap();
