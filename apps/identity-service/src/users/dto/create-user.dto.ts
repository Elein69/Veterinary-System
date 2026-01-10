import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'juan@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;
}