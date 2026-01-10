// Ubicación: apps/patient-service/src/patients/entities/patient.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('patients')
export class Patient {
  @ApiProperty({ example: 'uuid-1234', description: 'ID único de la mascota' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Firulais', description: 'Nombre del paciente' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Perro', description: 'Especie' })
  @Column()
  species: string;

  @ApiProperty({ example: 'Labrador', description: 'Raza' })
  @Column()
  breed: string;

  @ApiProperty({ example: 4, description: 'Edad' })
  @Column('int')
  age: number;

  @ApiProperty({ example: 'uuid-del-dueño', description: 'ID del Usuario (Dueño)' })
  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}