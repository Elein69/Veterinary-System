import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string; // ID del Paciente (viene de Patient Service)

  @Column()
  doctorId: string;  // ID del Doctor (viene de Staff Service)

  @Column()
  date: Date;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, CONFIRMED, COMPLETED, CANCELLED

  @CreateDateColumn()
  createdAt: Date;
}