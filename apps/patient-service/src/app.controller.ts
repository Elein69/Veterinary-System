import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  
  // Endpoint simple para verificar que el microservicio está vivo
  @MessagePattern({ cmd: 'health_check' })
  healthCheck() {
    return 'Patient Service: FUNCIONANDO 🚀';
  }
}