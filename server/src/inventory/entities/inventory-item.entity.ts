import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.inventoryItems)
  product: Product;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column()
  quantity: number;

  @Column({ default: 10 })
  lowStockThreshold: number;

  @Column({ default: false })
  isLowStock: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
