import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Importante para que funcione el Repository
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportamos por si Auth lo necesita después
})
export class UsersModule {}