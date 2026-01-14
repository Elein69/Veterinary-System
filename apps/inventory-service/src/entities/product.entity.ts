import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('int')
  stock: number;

  @Column('float')
  price: number;
}