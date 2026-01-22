import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('API_GATEWAY');
  const app = await NestFactory.create(AppModule);
  
  // Habilitamos CORS para que el frontend no tenga problemas después
  app.enableCors();

  // Verifica si estamos en AWS (ALB) o local
  // Si existe AWS_ALB_URL, significa que Terraform hizo su trabajo
  const isAws = !!process.env.AWS_ALB_URL;
  const targetUrl = isAws ? process.env.AWS_ALB_URL : 'http://localhost'; 

  // 📋 MAPA DE RUTAS:
  // incoming: Lo que escribes en el navegador (/api/...)
  // outgoing: Cómo se llama el servicio realmente en el ALB/Docker (/patient, /staff...)
  const services = [
    // Auth & Identity
    { incoming: '/api/auth', outgoing: '/identity', target: isAws ? targetUrl : process.env.IDENTITY_SERVICE_URL },
    
    // Patient (Ojo: incoming plural -> outgoing singular)
    { incoming: '/api/patients', outgoing: '/patient', target: isAws ? targetUrl : process.env.PATIENT_SERVICE_URL },
    
    // Medical (Ojo: incoming 'medical-records' -> outgoing 'medical')
    { incoming: '/api/medical-records', outgoing: '/medical', target: isAws ? targetUrl : process.env.MEDICAL_SERVICE_URL },
    
    // Appointment (Plural -> Singular)
    { incoming: '/api/appointments', outgoing: '/appointment', target: isAws ? targetUrl : process.env.APPOINTMENT_SERVICE_URL },
    
    // Otros servicios (Mapeo directo 1 a 1, pero quitando /api)
    { incoming: '/api/iot', outgoing: '/iot', target: isAws ? targetUrl : process.env.IOT_SERVICE_URL },
    { incoming: '/api/billing', outgoing: '/billing', target: isAws ? targetUrl : process.env.BILLING_SERVICE_URL },
    { incoming: '/api/inventory', outgoing: '/inventory', target: isAws ? targetUrl : process.env.INVENTORY_SERVICE_URL },
    { incoming: '/api/notifications', outgoing: '/notification', target: isAws ? targetUrl : process.env.NOTIFICATION_SERVICE_URL },
    { incoming: '/api/staff', outgoing: '/staff', target: isAws ? targetUrl : process.env.STAFF_SERVICE_URL },
    { incoming: '/api/audit', outgoing: '/audit', target: isAws ? targetUrl : process.env.AUDIT_SERVICE_URL },
  ];

  // Configuramos los proxies
  services.forEach(service => {
    app.use(service.incoming, createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathRewrite: {
        // 🪄 LA MAGIA:
        // Transforma "/api/patients/docs" -> "/patient/docs"
        [`^${service.incoming}`]: service.outgoing, 
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          // Log para depurar en CloudWatch
          logger.log(`🔀 Proxy: ${req.url} -> ${service.target}${service.outgoing}`);
        },
        error: (err, req, res) => {
          logger.error(`❌ Falló proxy hacia ${service.target}: ${err.message}`);
        }
      }
    }));
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('---------------------------------------------------------');
  console.log(`🏰 API GATEWAY PORT: ${port}`);
  console.log(`🌍 MODO: ${isAws ? 'AWS CLOUD (ALB)' : 'LOCAL'}`);
  if (isAws) console.log(`🔗 Target ALB: ${targetUrl}`);
  console.log('---------------------------------------------------------');
}
bootstrap();