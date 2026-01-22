import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('billing');
  app.enableCors();
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'], 
      },
      consumer: {
        groupId: 'billing-consumer-group', 
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3006);
  console.log('💰 Billing Service corriendo en HTTP:3006 y Kafka');
}
bootstrap();