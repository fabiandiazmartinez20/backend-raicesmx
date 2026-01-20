// src/seller-requests/entities/seller-request.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../admin/entities/admin.entity';

@Entity('seller_requests')
export class SellerRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'curp', length: 18 })
  curp: string;

  @Column({ name: 'ine_front_url', length: 500 })
  ineFrontUrl: string;

  @Column({ name: 'ine_back_url', length: 500, nullable: true })
  ineBackUrl: string;

  @Column({ name: 'ine_front_public_id', length: 255 })
  ineFrontPublicId: string;

  @Column({ name: 'ine_back_public_id', length: 255, nullable: true })
  ineBackPublicId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: number;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: Admin;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
