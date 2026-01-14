import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// 👇 IMPORTANTE: Necesario para recibir mensajes de RabbitMQ
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  // Creamos un Logger para ver en la consola cuando llega el mensaje
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // ---------------------------------------------------
  // ENDPOINTS HTTP (Para Login desde Web/Mobile)
  // ---------------------------------------------------

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y crear caché en Redis' })
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión y limpiar Redis' })
  logout(@Body('token') token: string) {
    return this.authService.logout(token);
  }

  // ---------------------------------------------------
  // HANDLERS RABBITMQ (Para comunicación entre Microservicios)
  // ---------------------------------------------------

  // 👇 ESTO ES LO QUE FALTABA
  // Escucha cuando Appointment Service grita "validate_user"
  @MessagePattern('validate_user')
  validateUser(@Payload() data: { userId: string }) {
    this.logger.log(`🐰 [RabbitMQ] Solicitud recibida: Validar usuario ${data.userId}`);
    
    // Aquí podrías llamar a this.authService.validateUser(data.userId)
    // Por ahora devolvemos TRUE para confirmar que la comunicación funciona
    const isValid = true; 
    
    this.logger.log(`✅ [RabbitMQ] Respuesta enviada: ${isValid}`);
    return isValid;
  }
}