// apps/audit-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    // Hacemos que ConfigModule esté disponible globalmente
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Configuración asíncrona de TypeORM para usar variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT')) || 5432,
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [AuditLog],
        synchronize: true, // Solo para desarrollo
      }),
    }),

    // Hacemos disponible la entidad AuditLog
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
