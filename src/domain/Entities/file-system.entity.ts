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
  name: string;

  @Column()
  path: string;

  @Column({ default: 0 })
  size: number; // Default size for directories

  @ManyToOne(() => Hash)
  @JoinColumn()
  hash: Hash | null; // Hash can now be null

  @Column({ default: 'folder' })
  mimeType: string; // Default mimeType for directories

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createDate: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updateDate: Date;

  @Column({ default: 'system' })
  createdBy: string; // Default value for createdBy

  @Column({ default: 'system' })
  updatedBy: string; // Default value for updatedBy

  constructor(rawData: Partial<FsNode>) {
    Object.assign(this, rawData);
  }
}
