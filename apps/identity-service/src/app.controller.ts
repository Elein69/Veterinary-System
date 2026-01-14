import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 👂 ESTA ES LA PARTE IMPORTANTE
  @MessagePattern('validate_user') 
  validateUser(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('🐰 [Identity] Mensaje RabbitMQ recibido:', data);
    
    // Aquí validamos el usuario (simulado por ahora)
    return { 
      status: 'success', 
      valid: true, 
      user: 'Usuario Verificado',
      timestamp: new Date().toISOString()
    };
  }
}