/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IFileSystemRepository } from 'src/repositories/files-system.repository';
import { FsNode } from 'src/domain/Entities/file-system.entity';
import {
  IDirectory,
  IFile,
} from 'src/domain/Interfaces/file-system.interfaces';
// import { HashService } from 'src/services/hash.service';
import * as path from 'path';
import { mkdir, rm, writeFile as writeFileInStorage } from 'fs/promises';
import { Hash } from 'src/domain/Entities/hash.entity';
import { IHashRepository } from 'src/repositories/hash.repository';

@Injectable()
export class FileSystemService {
  constructor(
    @Inject('FilesSystemRepository')
    private readonly filesRepository: IFileSystemRepository,
    @Inject('HashRepository')
    private readonly hashRepository: IHashRepository,
  ) {}

  async getDirectories(): Promise<FsNode[]> {
    return await this.filesRepository.getDirectories();
  }

  async createDirectory(directoryData: IDirectory): Promise<FsNode> {
    const assetsDir = path.join(process.cwd(), `assets/${directoryData.path}`);
    await mkdir(assetsDir, { recursive: true });
    return await this.filesRepository.createNode(directoryData);
  }

  async deleteDirectory(directoryPath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), 'assets', directoryPath);

    try {
      const NodesToDelete =
        await this.filesRepository.deleteNodesByPathPrefix(directoryPath);

      const hashesToModify = NodesToDelete.filter((node) => {
        return node.hash !== null;
      }).map((node) => {
        return node.hash;
      });

      for (const fileHash of hashesToModify) {
        await this.hashRepository.decreaseOrDeleteHash(fileHash as Hash); // Decrease or delete
      }

      await rm(fullPath, { recursive: true, force: true });
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete directory: ${error.message}`,
      );
    }
  }

  async writeFile(fileData: IFile, file: Express.Multer.File): Promise<FsNode> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    // const fileHash = await this.hashService.getOrCreateFileHash(file.buffer);
    // const assetsFolderPath = path.join(process.cwd(), 'assets' + fileData.path);
    // const filePath = path.join(assetsFolderPath, fileHash.hash);
    // await writeFileInStorage(filePath, file.buffer);
    const newFile = new FsNode({
      name: fileData.name,
      path: fileData.path,
      mimeType: fileData.mimeType,
      size: fileData.size,
      // hash: { id: fileHash } as Hash,
    });
    return await this.filesRepository.createNode(newFile);
  }

  async deleteFile(id: number): Promise<FsNode> {
    const deletedNode = await this.filesRepository.deleteNode(id);
    const assetsFolderPath = path.join(
      process.cwd(),
      'assets' + deletedNode.path,
      deletedNode.hash?.hash as string,
    );
    await rm(assetsFolderPath);
    const deletedNodeFileHash = deletedNode.hash;
    await this.hashRepository.decreaseOrDeleteHash(deletedNodeFileHash as Hash);
    return deletedNode;
  }
}
