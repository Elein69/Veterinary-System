import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('API_GATEWAY');
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const services = [
    { path: '/auth', target: 'http://localhost:3001' },
    { path: '/patients', target: 'http://localhost:3002' },
    { path: '/medical-records', target: 'http://localhost:3003' },
    { path: '/iot', target: 'http://localhost:3004' },
    { path: '/appointments', target: 'http://localhost:3005' },
    { path: '/billing', target: 'http://localhost:3006' },
    { path: '/inventory', target: 'http://localhost:3007' },
    { path: '/notifications', target: 'http://localhost:3008' },
    { path: '/staff', target: 'http://localhost:3009' },
    { path: '/audit', target: 'http://localhost:3010' },
  ];

  services.forEach(service => {
    app.use(service.path, createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathRewrite: { [`^${service.path}`]: '' },
      // 👇 Aquí está la corrección para la nueva versión de la librería
      on: {
        proxyReq: (proxyReq, req: any, res) => {
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
  console.log('---------------------------------------------------------');
}
bootstrap();