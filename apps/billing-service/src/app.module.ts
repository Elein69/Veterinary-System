import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingModule } from './billing/billing.module'; // 👈 Tu nuevo módulo
import { HealthController } from './health.controller';


@Module({
  imports: [
    // 1. Configuración
    ConfigModule.forRoot({
      envFilePath: 'apps/billing-service/.env',
      isGlobal: true,
    }),

    // 2. Base de Datos
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST') || 'postgres', // <- nombre del contenedor en docker-compose
    port: config.get<number>('DB_PORT') || 5432,
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true,
  }),
}),


    // 3. Módulo Funcional
    BillingModule,
  ],
  controllers: [
    HealthController, // ✅ ahora sí existe
  ],
})
export class AppModule {}