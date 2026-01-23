import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // 👈 Cambiamos a AppModule
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // 👈 Cambiamos a AppModule
  app.enableCors();
  app.setGlobalPrefix('appointment');

  const config = new DocumentBuilder()
    .setTitle('Appointment Service')
    .setDescription('Orquestador de Citas (Postgres + Kafka + Rabbit)')
    .setVersion('1.0')
    .build(); 
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('appointment/docs', app, document);

  await app.listen(3005);
  console.log('📅 Appointment Service running on: http://localhost:3005/docs');
}
bootstrap();