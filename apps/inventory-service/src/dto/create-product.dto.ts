import { IsString, IsInt, IsPositive, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Dewormer Tablet', description: 'Name of the medicine' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 100, description: 'Initial stock quantity' })
  @IsInt()
  @IsPositive()
  stock!: number;

  @ApiProperty({ example: 15.50, description: 'Unit price' })
  @IsNumber()
  @IsPositive()
  price!: number;
}