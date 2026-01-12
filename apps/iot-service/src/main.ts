import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log("🔋 STARTING IOT SERVICE..."); // <--- LOG DE DEPURACIÓN

  try {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.enableCors();

    const config = new DocumentBuilder()
      .setTitle('Veterinary IoT Service')
      .setDescription('Telemetry and Vital Signs monitoring using InfluxDB')
      .setVersion('1.0')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT || 3004;
    await app.listen(port);
    console.log(`🚀 IoT Service running on: http://localhost:${port}/docs`);
  } catch (error) {
    console.error("❌ ERROR STARTING APP:", error); // <--- PARA VER EL ERROR REAL
  }
}
bootstrap();