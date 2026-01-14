import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTelemetryDto {
  @ApiProperty({ example: 'pet-uuid-123', description: 'ID of the patient (sensor source)' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 38.5, description: 'Body temperature in Celsius' })
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @ApiProperty({ example: 90, description: 'Heart rate in BPM' })
  @IsNumber()
  @IsNotEmpty()
  heartRate: number;
}