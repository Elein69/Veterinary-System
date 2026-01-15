import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('API_GATEWAY');
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // URL del Load Balancer (DNS que te da AWS)
  const ALB_URL = 'http://vet-system-qa-alb-1361856451.us-east-1.elb.amazonaws.com';

  const services = [
    { path: '/auth', target: `${ALB_URL}` },
    { path: '/patients', target: `${ALB_URL}` },
    { path: '/medical-records', target: `${ALB_URL}` },
    { path: '/iot', target: `${ALB_URL}` },
    { path: '/appointments', target: `${ALB_URL}` },
    { path: '/billing', target: `${ALB_URL}` },
    { path: '/inventory', target: `${ALB_URL}` },
    { path: '/notifications', target: `${ALB_URL}` },
    { path: '/staff', target: `${ALB_URL}` },
    { path: '/audit', target: `${ALB_URL}` },
  ];

  services.forEach(service => {
    app.use(service.path, createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathRewrite: { [`^${service.path}`]: service.path }, // Mantenemos el path para que el ALB sepa a dónde enviarlo
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

  const port = 3000;
  await app.listen(port);
  
  console.log('---------------------------------------------------------');
  console.log(`🏰 API GATEWAY PORT: ${port}`);
  console.log(`🔗 REDIRIGIENDO AL ALB: ${ALB_URL}`);
  console.log('---------------------------------------------------------');
}
bootstrap();