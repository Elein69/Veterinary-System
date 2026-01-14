import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // Ejemplo: 'STAFF_MANAGEMENT', 'BILLING_EVENT'

  @Column({ type: 'jsonb' }) // jsonb es excelente en Postgres para guardar payloads variables
  payload: any;

  @CreateDateColumn()
  createdAt: Date;
}