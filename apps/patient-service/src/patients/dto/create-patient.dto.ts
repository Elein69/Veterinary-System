import { IsNotEmpty, IsString, IsEmail, IsInt, Min } from 'class-validator';
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

  @ApiProperty({ example: 'Elein Inaquiza' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ example: 'elein@ejemplo.com' })
  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;
}