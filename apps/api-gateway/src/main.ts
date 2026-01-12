import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // URLs (Asegúrate de que coincidan con tus puertos)
  const SERVICES = {
    medical: 'http://localhost:3003',
    iot: 'http://localhost:3004', 
  };

  console.log('--- 🚀 GATEWAY INICIANDO ---');

  // 1. Proxy MEDICAL
  app.use('/medical-records', createProxyMiddleware({ 
    target: SERVICES.medical, 
    changeOrigin: true 
  }));

  // 2. Proxy IOT (API)
  app.use('/api/telemetry', createProxyMiddleware({ 
    target: SERVICES.iot, 
    changeOrigin: true 
  }));

  // 3. Proxy IOT (DOCS) - Configuración "Wildcard"
  // Captura TODO lo que empiece por /docs-iot
  app.use('/docs-iot', createProxyMiddleware({
    target: SERVICES.iot,
    changeOrigin: true,
    pathRewrite: { '^/docs-iot': '/docs' }, // Borra el prefijo y manda /docs
  }));

  await app.listen(3000);
  console.log(`Gateway listo: http://localhost:3000`);
  console.log(`Prueba IoT: http://localhost:3000/docs-iot/ (¡Ojo con la barra al final!)`);
}
bootstrap();