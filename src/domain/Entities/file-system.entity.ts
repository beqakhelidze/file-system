import { Hash } from 'src/domain/Entities/hash.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('file_system')
export class FsNode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ default: 0 })
  size: number;

  @ManyToOne(() => Hash)
  @JoinColumn()
  hash: Hash | null;

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
