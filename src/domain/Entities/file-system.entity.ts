import { Hash } from 'src/domain/entities/hash.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('file_system')
export class FsNode {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Hash)
  @JoinColumn()
  hash: Hash | null;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ default: 0 })
  size: number;

  @Column({ type: 'varchar', nullable: true })
  source: string | null;

  @Column({ default: 'folder' })
  mimeType: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createDate: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updateDate: Date;

  @Column({ default: 'system' })
  createdBy: string;

  @Column({ default: 'system' })
  updatedBy: string;

  constructor(rawData: Partial<FsNode>) {
    Object.assign(this, rawData);
  }
}
