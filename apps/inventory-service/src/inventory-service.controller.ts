import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { InventoryService } from './app.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';

@ApiTags('Inventory Management')
@Controller('inventory')
export class InventoryServiceController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern('medical_prescription_created')
  handlePrescriptionCreated(@Payload() data: any) {
    console.log('----------------------------------------------------');
    console.log('📦 [INVENTORY] Event Received from Medical Service');
    
    try {
      // Usamos los datos que vienen del evento, o valores de prueba si es necesario
      const productId = data.productId; 
      const quantity = data.quantity || 1;
      
      if (productId) {
        this.inventoryService.reduceStock(productId, quantity);
        console.log(`✅ [INVENTORY] Automatically deducted ${quantity} units of product ID ${productId}`);
      }
    } catch (error: any) { // Añade ': any' o haz una validación de tipo
       console.error(`❌ [INVENTORY] Could not deduct stock: ${error.message}`);
    }
    console.log('----------------------------------------------------');
  }
  
  @Get()
  @ApiOperation({ summary: 'List all products' })
  findAll() { 
    return this.inventoryService.findAll(); 
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'string', example: 'uuid-v4-here' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { 
    return this.inventoryService.findOne(id); 
  }

  @Post()
  @ApiOperation({ summary: 'Register new supply' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createProductDto: CreateProductDto) {
    return this.inventoryService.create(createProductDto);
  }

  @Patch('reduce')
  @ApiOperation({ summary: 'Consume stock manually' })
  @UsePipes(new ValidationPipe({ transform: true }))
  reduceStock(@Body() updateStockDto: UpdateStockDto) {
    return this.inventoryService.reduceStock(updateStockDto.productId, updateStockDto.quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove product' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.remove(id);
  }
}