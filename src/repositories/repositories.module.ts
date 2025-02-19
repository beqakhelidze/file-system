import { Module } from '@nestjs/common';
import { FilesSystemRepository } from './files-system.repository';
import { HashRepository } from './hash.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FsNode } from 'src/domain/Entities/file-system.entity';
import { Hash } from 'src/domain/Entities/hash.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FsNode]),
    TypeOrmModule.forFeature([Hash]),
  ],
  providers: [
    {
      provide: 'FilesSystemRepository',
      useClass: FilesSystemRepository,
    },
    {
      provide: 'HashRepository',
      useClass: HashRepository,
    },
  ],
  exports: ['FilesSystemRepository', 'HashRepository'],
})
export class RepositoriesModule {}
