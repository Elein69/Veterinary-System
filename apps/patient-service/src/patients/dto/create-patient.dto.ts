import { IsNotEmpty, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Firulais' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Perro' })
  @IsString()
  @IsNotEmpty()
  species: string;

  @ApiProperty({ example: 'Labrador' })
  @IsString()
  breed: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(0)
  age: number;

  @ApiProperty({ example: 'uuid-v4-del-user' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}