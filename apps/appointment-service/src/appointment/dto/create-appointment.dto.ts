import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'PACIENTE-TEST-01', description: 'ID del Paciente' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'DOCTOR-TEST-01', description: 'ID del Doctor' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  // 👇 AGREGA ESTO PARA QUE APAREZCA LA FECHA EN SWAGGER
  @ApiProperty({ 
    example: '2026-02-14T09:00:00Z', 
    description: 'Fecha de la cita (ISO 8601)',
    required: false 
  })
  @IsOptional()
  date?: Date;
}