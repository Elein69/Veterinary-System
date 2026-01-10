import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module'; // <--- Solo debe aparecer una vez
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    // 1. Configuración Global (lee el .env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Conexión a Base de Datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User],
        synchronize: true, // Esto crea las tablas automáticamente
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
})
export class AppModule {}