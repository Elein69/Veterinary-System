import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import Redis from 'ioredis';
import { HealthController } from './health.controller';

@Global()
@Module({
  imports: [
    // ConfigModule lee las variables de entorno del sistema (ECS) automáticamente
    ConfigModule.forRoot({
      isGlobal: true,
      // En producción/ECS ignorará el archivo si no existe y usará las variables de entorno
      envFilePath: 'apps/identity-service/.env', 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'), // ✅ Correcto (Viene de Terraform)
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ En producción real deberías desactivar esto, pero para QA está bien
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [HealthController,],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Redis({
          // 🚨 CORRECCIÓN: Quitamos 'vet_redis' y usamos 'localhost' como fallback seguro
          host: config.get<string>('REDIS_HOST') || 'localhost',
          port: config.get<number>('REDIS_PORT') || 6379,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {}