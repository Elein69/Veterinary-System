import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // 👈 Importamos UsersModule

@Module({
  imports: [UsersModule], // Necesitamos esto para usar UsersService
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}