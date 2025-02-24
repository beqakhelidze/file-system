import { Module } from '@nestjs/common';
import { FilesSystemRepository } from './files-system.repository';
import { HashRepository } from './hash.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FsNode } from 'src/domain/entities/file-system.entity';
import { Hash } from 'src/domain/entities/hash.entity';
import { UserRepository } from './user.repository';
import { User } from 'src/domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FsNode, Hash, User])],
  providers: [
    {
      provide: 'HashRepository1',
      useClass: HashRepository,
    },
    {
      provide: 'FilesSystemRepository',
      useClass: FilesSystemRepository,
    },
    {
      provide: 'UserRepository1',
      useClass: UserRepository,
    },
  ],
  exports: ['HashRepository1', 'FilesSystemRepository', 'UserRepository1'],
})
export class RepositoriesModule {}
