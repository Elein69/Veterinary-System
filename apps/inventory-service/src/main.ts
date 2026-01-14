import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Inventory_Main');
  const app = await NestFactory.create(InventoryServiceModule);

  // 1. Configuración de Kafka (Consumer)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'inventory-consumer-server', // ID único para este servicio
      },
    },
  });

  // 2. Swagger para documentación
  const config = new DocumentBuilder()
    .setTitle('Inventory Service (Senior Edition)')
    .setDescription('Reactive inventory management via Kafka')
    .setVersion('2.0')
    .addTag('Inventory')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 3. Arrancar todo
  await app.startAllMicroservices();
  await app.listen(3007);
  
  logger.log('💊 Inventory Service is running on HTTP:3007 and listening to Kafka');
}
bootstrap();