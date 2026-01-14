import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registramos la entidad
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportamos para que AuthModule lo pueda usar luego
})
export class UsersModule {}