import {
  Body,
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { FileSystemService } from 'src/services/file-system.service';
import { FsNode } from 'src/domain/entities/file-system.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/auth.guard';
import { RequestWithUserInfo } from 'src/domain/interfaces/request.interface';
import { User } from 'src/domain/entities/user.entity';
import { UploadedFileData } from 'src/domain/interfaces/uploadedFile.interface';

@Controller('')
@UseGuards(AuthGuard)
export class FileSystemController {
  constructor(private readonly fileSystemService: FileSystemService) {}

  @Get('directory')
  getDirectory(
    @Req() req: RequestWithUserInfo,
    @Query('path') path: string,
  ): Promise<FsNode[]> {
    return this.fileSystemService.getDirectory(req.user, path);
  }

  @Post('directory')
  createDirectory(
    @Req() req: RequestWithUserInfo,
    @Body() fileData: Partial<User>,
  ): Promise<FsNode> {
    return this.fileSystemService.createDirectory(req.user, fileData);
  }

  @Delete('directory')
  async deleteDirectory(
    @Req() req: RequestWithUserInfo,
    @Query('path') path: string,
  ) {
    await this.fileSystemService.deleteDirectory(req.user, path);
    return { message: `Directory '${path}' deleted successfully` };
  }

  @Post('copy-directory')
  async copyDirectory(
    @Req() req: RequestWithUserInfo,
    @Body() body: { path: string; newPath: string },
  ): Promise<{ message: string }> {
    const { path, newPath } = body;
    return await this.fileSystemService.copyDirectory(req.user, path, newPath);
  }

  @Post('move-directory')
  async moveDirectory(
    @Req() req: RequestWithUserInfo,
    @Body() body: { path: string; newPath: string },
  ): Promise<{ message: string }> {
    const { path, newPath } = body;
    return await this.fileSystemService.moveDirectory(req.user, path, newPath);
  }

  @Get('file')
  ReadFile(@Query('path') path: string): Promise<Buffer> {
    return this.fileSystemService.readFile(path);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  writeFile(
    @Req() req: RequestWithUserInfo,
    @UploadedFile() file: Express.Multer.File,
    @Body() fileData: Partial<FsNode>,
  ): Promise<FsNode> {
    const uploadedFile: UploadedFileData = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
    return this.fileSystemService.writeFile(req.user, fileData, uploadedFile);
  }

  @Delete('file')
  async deleteFile(
    @Req() req: RequestWithUserInfo,
    @Query('path') path: string,
  ) {
    return await this.fileSystemService.deleteFile(req.user, path);
  }

  @Post('copy-file')
  async copyFile(
    @Req() req: RequestWithUserInfo,
    @Body() body: { path: string; newPath: string },
  ): Promise<FsNode> {
    const { path, newPath } = body;
    return await this.fileSystemService.copyFile(req.user, path, newPath);
  }

  @Post('move-file')
  async moveFile(
    @Req() req: RequestWithUserInfo,
    @Body() body: { path: string; newPath: string },
  ): Promise<{ message: string }> {
    const { path, newPath } = body;
    return await this.fileSystemService.moveFile(req.user, path, newPath);
  }
}
