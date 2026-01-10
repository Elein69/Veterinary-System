import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// --- DEFINICIÓN DE ROLES ---
export enum UserRole {
  ADMIN = 'admin',
  VET = 'veterinarian',
  USER = 'user',
}

@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid-1234', description: 'ID único' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'doctor@vet.com' })
  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Seguridad: No enviar password al frontend
  password: string;

  @ApiProperty({ example: 'Dr. House' })
  @Column()
  fullName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}