import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FsNode } from './file-system.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => FsNode, (fsNode) => fsNode.user, { cascade: true })
  files: FsNode[];
}
