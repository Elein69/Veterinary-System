import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 'uuid-patient-123', description: 'ID of the Patient (Pet)' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid-vet-456', description: 'ID of the Veterinarian' })
  @IsString()
  @IsNotEmpty()
  veterinarianId: string;

  @ApiProperty({ example: 'Gastroenteritis', description: 'Medical diagnosis' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({ example: 'Antibiotics and hydration', description: 'Prescribed treatment' })
  @IsString()
  @IsNotEmpty()
  treatment: string;

  @ApiProperty({ example: 'Patient seems lethargic', description: 'Additional observations', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}