import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.setGlobalPrefix('patient');

  const config = new DocumentBuilder()
    .setTitle('Patient Service')
    .setDescription('Gestión de Pacientes y Dueños')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('patient/docs', app, document);

  await app.listen(3002);
  console.log('🐾 Patient Service corriendo en: http://localhost:3002/docs');
}
bootstrap();