import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientProxy,
  ) {}

  async findAll() {
    return await this.productRepo.find();
  }

  async findOne(id: string) {
    const item = await this.productRepo.findOneBy({ id });
    if (!item) throw new NotFoundException(`Product ${id} not found`);
    return item;
  }

  async create(dto: CreateProductDto) {
    const newProduct = this.productRepo.create(dto);
    return await this.productRepo.save(newProduct);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    return await this.productRepo.remove(item);
  }

  async reduceStock(productId: string, quantity: number) {
    const item = await this.productRepo.findOneBy({ id: productId });

    if (!item) throw new NotFoundException(`Product ID ${productId} not found`);

    if (item.stock < quantity) {
      throw new BadRequestException(`Insufficient stock for ${item.name}`);
    }

    item.stock -= quantity;
    const updatedItem = await this.productRepo.save(item);

    if (updatedItem.stock < 10) {
      this.triggerLowStockAlert(updatedItem);
    }

    return updatedItem;
  }

  private triggerLowStockAlert(item: Product) {
    this.logger.warn(`🚨 LOW STOCK ALERT: ${item.name} is running low!`);
    this.kafkaClient.emit('inventory_low_stock', {
      productId: item.id,
      name: item.name,
      currentStock: item.stock,
    });
  }
}