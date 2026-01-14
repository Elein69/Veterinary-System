import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { StaffServiceController } from './staff-service.controller';
import { StaffService } from './app.service';
import { Staff } from './entities/staff.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/staff-service/.env',
    }),
    // 🗄️ Conexión a PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Staff],
        synchronize: true, 
      }),
    }),
    TypeOrmModule.forFeature([Staff]),

    // 📡 Registro de Cliente Kafka
    ClientsModule.register([
      {
        name: 'STAFF_KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: { brokers: ['127.0.0.1:9092'] },
          consumer: { groupId: 'staff-consumer' },
        },
      },
    ]),
  ],
  controllers: [StaffServiceController],
  providers: [StaffService],
})
export class StaffServiceModule {}