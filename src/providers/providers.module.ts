import { Module } from '@nestjs/common';
import { FsProvider } from './fs.providers';
import { HashProvider } from './hash.provider';

@Module({
  imports: [],
  providers: [
    {
      provide: 'FsProvider',
      useClass: FsProvider,
    },
    {
      provide: 'HashProvider',
      useClass: HashProvider,
    },
  ],
  exports: ['FsProvider', 'HashProvider'],
})
export class ProvidersModule {}
