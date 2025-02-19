import { Module } from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { HashService } from './hash.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
@Module({
  imports: [RepositoriesModule],
  providers: [FileSystemService, HashService],
  exports: [FileSystemService, HashService],
})
export class ServicesModule {}
