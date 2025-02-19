import {
  Body,
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
} from '@nestjs/common';
import { FileSystemService } from 'src/services/file-system.service';
import { FsNode } from 'src/domain/Entities/file-system.entity';
import {
  IDirectory,
  IFile,
} from 'src/domain/Interfaces/file-system.interfaces';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('')
export class FileSystemController {
  constructor(private readonly fileSystemService: FileSystemService) {}

  @Get('directory')
  getDirectories(): Promise<FsNode[]> {
    return this.fileSystemService.getDirectories();
  }

  @Post('directory')
  createDirectory(@Body() fileData: IDirectory): Promise<FsNode> {
    return this.fileSystemService.createDirectory(fileData);
  }

  @Delete('directory')
  async deleteDirectory(@Body() { path }: { path: string }) {
    await this.fileSystemService.deleteDirectory(path);
    return { message: `Directory '${path}' deleted successfully` };
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  writeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() fileData: IFile,
  ): Promise<FsNode> {
    return this.fileSystemService.writeFile(fileData, file);
  }

  @Delete('file/:id')
  async deleteFile(@Param('id') id: string) {
    return await this.fileSystemService.deleteFile(Number(id));
  }
}
