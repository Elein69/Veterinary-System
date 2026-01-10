import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // URLs de tus microservicios
  const identityService = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
  const patientService = process.env.PATIENT_SERVICE_URL || 'http://localhost:3002';

  // --- CONFIGURACIÓN DE PROXIES (Versión 3.0 Compatible) ---
  
  // NOTA: No ponemos la ruta en app.use(), la ponemos adentro de pathFilter.
  // Esto evita que NestJS recorte la URL y soluciona el error 404.

  // 1. Proxy para Identity Service
  app.use(
    createProxyMiddleware({
      target: identityService,
      changeOrigin: true,
      // Aquí definimos qué rutas capturar:
      pathFilter: ['/api/users', '/api/auth'], 
    }),
  );

  // 2. Proxy para Patient Service
  app.use(
    createProxyMiddleware({
      target: patientService,
      changeOrigin: true,
      pathFilter: ['/api/patients'],
    }),
  );

  // 3. Documentación Identity
  app.use(
    createProxyMiddleware({
      target: identityService,
      changeOrigin: true,
      pathFilter: ['/docs-identity'],
      pathRewrite: { '^/docs-identity': '/docs' },
    }),
  );

  // 4. Documentación Patients
  app.use(
    createProxyMiddleware({
      target: patientService,
      changeOrigin: true,
      pathFilter: ['/docs-patients'],
      pathRewrite: { '^/docs-patients': '/docs' },
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 API Gateway corriendo en: http://localhost:3000`);
}
bootstrap();