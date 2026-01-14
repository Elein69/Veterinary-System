import { Injectable, Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    // 👇 Inyectamos Redis (Configurado en AppModule)
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async login(email: string, pass: string) {
    // 1. Buscamos el usuario en Postgres
    const user = await this.usersService.findOneByEmail(email);
    
    // 2. Validamos si existe y si la contraseña coincide
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Generamos un token de sesión (Simulado para cumplir requisito Cache)
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // 4. Guardamos en REDIS: Clave=token, Valor=userId, Expira=1 hora (3600s)
    await this.redis.set(`session:${token}`, user.id, 'EX', 3600);
    
    this.logger.log(`🔑 Login exitoso. Sesión guardada en Redis para: ${user.email}`);

    return {
      message: 'Login exitoso',
      access_token: token,
      user_id: user.id
    };
  }

  async logout(token: string) {
    await this.redis.del(`session:${token}`);
    return { message: 'Sesión cerrada correctamente' };
  }
}