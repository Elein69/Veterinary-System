import { IsInt, IsPositive, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({ example: 'uuid-v4-generated', description: 'The UUID of the product' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 5, description: 'Quantity to reduce' })
  @IsInt()
  @IsPositive()
  quantity: number;
}