import { IsString, IsEnum, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Specialty {
  SURGERY = 'Surgery',
  CARDIOLOGY = 'Cardiology',
  GENERAL = 'General Medicine',
  DIAGNOSTICS = 'Diagnostics'
}

export class CreateStaffDto {
  @ApiProperty({ example: 'Dr. Gregory House' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Specialty, example: Specialty.DIAGNOSTICS })
  @IsEnum(Specialty)
  specialty: Specialty;

  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable: boolean;
}