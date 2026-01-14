import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Configuración de Kafka (Consumer)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'], // Broker de Kafka
      },
      consumer: {
        groupId: 'billing-consumer-group', // ID único del grupo
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3006);
  console.log('💰 Billing Service corriendo en HTTP:3006 y Kafka');
}
bootstrap();