import { Module } from '@nestjs/common';
import { FileSystemController } from './file-system.controller';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [ServicesModule],
  controllers: [FileSystemController],
})
export class ControllersModule {}
