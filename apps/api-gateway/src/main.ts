import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('API_GATEWAY');
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Verifica si estamos en AWS (ALB) o local
  const isAws = !!process.env.AWS_ALB_URL;

  const services = [
    { path: '/auth', target: isAws ? process.env.AWS_ALB_URL : process.env.IDENTITY_SERVICE_URL },
    { path: '/patients', target: isAws ? process.env.AWS_ALB_URL : process.env.PATIENT_SERVICE_URL },
    { path: '/medical-records', target: isAws ? process.env.AWS_ALB_URL : process.env.MEDICAL_SERVICE_URL },
    { path: '/iot', target: isAws ? process.env.AWS_ALB_URL : process.env.IOT_SERVICE_URL },
    { path: '/appointments', target: isAws ? process.env.AWS_ALB_URL : process.env.APPOINTMENT_SERVICE_URL },
    { path: '/billing', target: isAws ? process.env.AWS_ALB_URL : process.env.BILLING_SERVICE_URL },
    { path: '/inventory', target: isAws ? process.env.AWS_ALB_URL : process.env.INVENTORY_SERVICE_URL },
    { path: '/notifications', target: isAws ? process.env.AWS_ALB_URL : process.env.NOTIFICATION_SERVICE_URL },
    { path: '/staff', target: isAws ? process.env.AWS_ALB_URL : process.env.STAFF_SERVICE_URL },
    { path: '/audit', target: isAws ? process.env.AWS_ALB_URL : process.env.AUDIT_SERVICE_URL },
  ];

  // Configuramos los proxies
  services.forEach(service => {
    app.use(service.path, createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathRewrite: { [`^${service.path}`]: service.path },
      on: {
        proxyReq: (proxyReq, req: any) => {
          logger.log(`🔀 Redirigiendo: ${req.method} ${req.url} -> ${service.target}`);
        },
        error: (err, req, res) => {
          logger.error(`❌ Error en el proxy hacia ${service.target}: ${err.message}`);
        }
      }
    }));
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('---------------------------------------------------------');
  console.log(`🏰 API GATEWAY PORT: ${port}`);
  console.log(`🔗 Redirigiendo a ${isAws ? process.env.AWS_ALB_URL : 'microservicios locales'}`);
  console.log('---------------------------------------------------------');
}
bootstrap();
