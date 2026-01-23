import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryService } from './app.service';
import { Product } from './entities/product.entity';
import { HealthController } from './health.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/inventory-service/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST') || 'postgres',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get('DB_USERNAME') || 'postgres',
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME') || 'veterinary_db',
        autoLoadEntities: true,
        synchronize: true,
        entities: [Product],
      }),
    }),
    TypeOrmModule.forFeature([Product]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { brokers: [process.env.KAFKA_BROKER || 'kafka:9092'] },
          consumer: { groupId: 'inventory-consumer' },
        },
      },
    ]),
  ],
  controllers: [InventoryServiceController, HealthController],
  providers: [InventoryService],
})
export class InventoryServiceModule {}
