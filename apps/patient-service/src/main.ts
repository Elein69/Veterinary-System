import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Validaciones Globales
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  
  // Filtro de Excepciones (DRY)
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Veterinary Patient Service')
    .setDescription('Microservicio de Mascotas')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // PUERTO 3002
  await app.listen(process.env.PORT || 3002);
  console.log(`🚀 Patient Service corriendo en: http://localhost:3002/docs`);
}
bootstrap();