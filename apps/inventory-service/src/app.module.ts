import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryService } from './app.service';
import { Product } from './entities/product.entity'; // Crea esta entidad

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/inventory-service/.env',
    }),
    // Configuración Postgres
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get('DB_USERNAME') || 'postgres',
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME') || 'veterinary_db',
        entities: [Product],
        synchronize: true, 
      }),
    }),
    TypeOrmModule.forFeature([Product]),
    // Configuración Kafka
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { brokers: ['127.0.0.1:9092'] },
          consumer: { groupId: 'inventory-consumer' },
        },
      },
    ]),
  ],
  controllers: [InventoryServiceController],
  providers: [InventoryService],
})
export class InventoryServiceModule {}