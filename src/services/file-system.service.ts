/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IFileSystemRepository } from 'src/repositories/files-system.repository';
import { FsNode } from 'src/domain/Entities/file-system.entity';
import { Hash } from 'src/domain/Entities/hash.entity';
import { IHashRepository } from 'src/repositories/hash.repository';
import { IFsProvider } from 'src/domain/Interfaces/fsProvider.interface';
import { IHashProvider } from 'src/domain/Interfaces/hashProvider.interface';
import { User } from 'src/domain/Entities/user.entity';
import { UploadedFileData } from 'src/domain/Interfaces/uploadedFile.interface';

@Injectable()
export class FileSystemService {
  constructor(
    @Inject('FilesSystemRepository')
    private readonly filesRepository: IFileSystemRepository,
    @Inject('HashRepository1')
    private readonly hashRepository: IHashRepository,
    @Inject('FsProvider')
    private readonly FsProvider: IFsProvider,
    @Inject('HashProvider')
    private readonly HashProvider: IHashProvider,
  ) {}

  async getDirectory(user: User, path: string): Promise<FsNode[]> {
    return this.filesRepository.getDirectory(user.id, path);
  }

  async createDirectory(
    user: User,
    directoryData: Partial<FsNode>,
  ): Promise<FsNode> {
    await this.FsProvider.createDirectory(
      user.username,
      `${directoryData.path}/${directoryData.name}`,
    );
    const node = new FsNode({
      ...directoryData,
      path: `${directoryData.path}${directoryData.name}`,
      createdBy: user.username,
      userId: user.id,
    });
    return this.filesRepository.createNode(node);
  }

  async deleteDirectory(user: User, path: string): Promise<void> {
    const nodesToDelete = await this.filesRepository.deleteNodesByPathPrefix(
      user.id,
      path,
    );

    const uniqueHashes = new Map<number, { hashId: number; count: number }>();

    nodesToDelete.forEach((node) => {
      if (node.hash !== null) {
        const existingHash = uniqueHashes.get(node.hash.id);
        if (existingHash) {
          existingHash.count -= 1;
        } else {
          uniqueHashes.set(node.hash.id, {
            hashId: node.hash.id,
            count: node.hash.count - 1,
          });
        }
      }
    });

    for (const { hashId, count } of uniqueHashes.values()) {
      if (count === 0) {
        await this.hashRepository.deleteHash(hashId);
      } else {
        await this.hashRepository.modifyHashCount(hashId, count);
      }
    }

    await this.FsProvider.deleteDirectory(path);
  }

  async copyDirectory(
    user: User,
    path: string,
    newPath: string,
  ): Promise<{ message: string }> {
    await this.FsProvider.copyNode(user.username, path, newPath);
    const nodesToDoublicate = await this.filesRepository.copyDirectory(
      user.id,
      path,
      newPath,
    );

    const uniqueHashes = new Map<number, { hashId: number; count: number }>();

    nodesToDoublicate.forEach((node) => {
      if (node.hash !== null) {
        const existingHash = uniqueHashes.get(node.hash.id);
        if (existingHash) {
          existingHash.count += 1;
        } else {
          uniqueHashes.set(node.hash.id, {
            hashId: node.hash.id,
            count: 1,
          });
        }
      }
    });

    for (const { hashId, count } of uniqueHashes.values()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.hashRepository.modifyHashCount(hashId, count * 2);
    }

    return { message: 'Directory copied successfully' };
  }

  async moveDirectory(
    user: User,
    path: string,
    newPath: string,
  ): Promise<{ message: string }> {
    await this.copyDirectory(user, path, newPath);
    await this.deleteDirectory(user, path);
    return { message: 'Directory moved successfully' };
  }

  async readFile(path: string): Promise<Buffer> {
    return await this.FsProvider.readFile(path);
  }

  async writeFile(
    user: User,
    fileData: Partial<FsNode>,
    file: UploadedFileData,
  ): Promise<FsNode> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileHash = this.HashProvider.hashFile(file.buffer);
    const storedHash: Hash = await this.hashRepository.addHash(fileHash);
    await this.FsProvider.writeFile(fileHash, file.buffer);
    const newFile = new FsNode({
      ...fileData,
      path: `${fileData.path}/${storedHash.hash}`,
      mimeType: file.mimetype,
      userId: user.id,
      hash: storedHash,
    });
    return await this.filesRepository.createNode(newFile);
  }

  async deleteFile(user: User, path: string): Promise<FsNode> {
    const deletedNode = await this.filesRepository.deleteFileByPath(
      user.id,
      path,
    );

    if (deletedNode.hash === null) return deletedNode;

    if (deletedNode.hash.count === 1) {
      await this.hashRepository.deleteHash(deletedNode.hash.id);
      await this.FsProvider.removeFile(deletedNode.hash.hash);
    } else {
      await this.hashRepository.modifyHashCount(
        deletedNode.hash.id,
        deletedNode.hash.count - 1,
      );
    }
    return deletedNode;
  }

  async copyFile(user: User, path: string, newPath: string): Promise<FsNode> {
    const fileToCopy = await this.filesRepository.findFileByPath(user.id, path);

    if (!fileToCopy) throw new Error("Can't find file");

    const newFile = new FsNode({
      ...fileToCopy,
      id: undefined,
      path: `${newPath}/${fileToCopy.hash?.hash}`,
    });

    return this.filesRepository.createNode(newFile);
  }

  async moveFile(
    user: User,
    path: string,
    newPath: string,
  ): Promise<{ message: string }> {
    await this.copyFile(user, path, newPath);
    await this.deleteFile(user, path);
    return { message: 'Directory moved successfully' };
  }
}
