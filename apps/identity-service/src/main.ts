import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// Asegúrate de que esta ruta sea correcta según donde creaste el archivo filter
import { AllExceptionsFilter } from './common/filters/http-exception.filter'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Prefijo API global (Ej: http://localhost:3001/api/users)
  app.setGlobalPrefix('api');

  // 2. Validaciones Globales (DTOs)
  // whitelist: true -> Elimina datos basura que envíen en el JSON
  // forbidNonWhitelisted: true -> Lanza error si envían datos extra
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 3. FILTRO DE EXCEPCIONES GLOBAL (Clean Code / DRY)
  // Esto captura cualquier error y lo devuelve en formato JSON estándar
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Habilitar CORS (Requisito del Inge)
  app.enableCors();

  // 5. Configurar SWAGGER (Good documentation)
  const config = new DocumentBuilder()
    .setTitle('Veterinary Identity Service')
    .setDescription('Microservicio de Usuarios, Roles y Autenticación')
    .setVersion('1.0')
    .addBearerAuth() // Preparado para cuando agreguemos JWT
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Documentación en /docs

  // Iniciar servidor
  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Microservicio corriendo en: http://localhost:3001/docs`);
}
bootstrap();