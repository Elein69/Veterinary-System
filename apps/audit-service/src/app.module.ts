import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service'; // Lo crearemos abajo
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Veterinaria2026!', // Tu clave de Postgres
      database: 'veterinary_db',
      entities: [AuditLog],
      synchronize: true, // Esto creará la tabla 'audit_logs' automáticamente
    }),
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}