import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { FsNode } from './file-system.entity';

@Entity()
export class Hash {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  hash: string;

  @Column()
  count: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => FsNode, (FsNode) => FsNode.hash)
  fileSystem: FsNode[];
}
