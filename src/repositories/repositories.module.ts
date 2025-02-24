import { Module } from '@nestjs/common';
import { FilesSystemRepository } from './files-system.repository';
import { HashRepository1 } from './hash.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FsNode } from 'src/domain/entities/file-system.entity';
import { Hash } from 'src/domain/entities/hash.entity';
import { AuthRepository } from './auth.repository';
import { User } from 'src/domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FsNode, Hash, User])],
  providers: [
    {
      provide: 'HashRepository1',
      useClass: HashRepository1,
    },
    {
      provide: 'FilesSystemRepository',
      useClass: FilesSystemRepository,
    },
    {
      provide: 'AuthRepository',
      useClass: AuthRepository,
    },
  ],
  exports: ['HashRepository1', 'FilesSystemRepository', 'AuthRepository'],
})
export class RepositoriesModule {}
