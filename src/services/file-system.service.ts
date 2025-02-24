import { Injectable, Inject } from '@nestjs/common';
import { IFileSystemRepository } from 'src/domain/interfaces/files-system.repository.interface';
import { FsNode } from 'src/domain/entities/file-system.entity';
import { Hash } from 'src/domain/entities/hash.entity';
import { IFsProvider } from 'src/domain/interfaces/fsProvider.interface';
import { IHashProvider } from 'src/domain/interfaces/hashProvider.interface';
import { User } from 'src/domain/entities/user.entity';
import { UploadedFileData } from 'src/domain/interfaces/uploadedFile.interface';
import { IHashRepository } from 'src/domain/interfaces/hash.repository.interface';

@Injectable()
export class FileSystemService {
  constructor(
    @Inject('FilesSystemRepository')
    private readonly filesRepository: IFileSystemRepository,
    @Inject('HashRepository1')
    private readonly hashRepository: IHashRepository,
    @Inject('FsProvider')
    private readonly fsProvider: IFsProvider,
    @Inject('HashProvider')
    private readonly hashProvider: IHashProvider,
  ) {}

  async getDirectory(user: User, path: string): Promise<FsNode[]> {
    return this.filesRepository.getDirectory(user.id, path);
  }

  async createDirectory(
    user: User,
    directoryData: Partial<FsNode>,
  ): Promise<FsNode> {
    await this.fsProvider.createDirectory(
      `${user.username}/${directoryData.path}/${directoryData.name}`,
    );
    const node = new FsNode({
      ...directoryData,
      path: `${directoryData.path}/${directoryData.name}`,
      createdBy: user.username,
      user: user,
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

    const uniqueHashArray = Array.from(uniqueHashes.values());

    await Promise.all(
      uniqueHashArray.map(({ hashId, count }) => {
        if (count === 0) {
          return this.hashRepository.deleteHash(hashId); // return the promise
        } else {
          return this.hashRepository.modifyHashCount(hashId, count); // return the promise
        }
      }),
    );

    await this.fsProvider.deleteDirectory(path);
  }

  async copyDirectory(
    user: User,
    path: string,
    newPath: string,
  ): Promise<{ message: string }> {
    await this.fsProvider.copyNode(
      `${user.username}/${path}`,
      `${user.username}/${newPath}`,
    );
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

    const uniqueHashArray = Array.from(uniqueHashes.values());

    await Promise.all(
      uniqueHashArray.map(({ hashId, count }) => {
        this.hashRepository.modifyHashCount(hashId, count * 2);
      }),
    );

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
    return this.fsProvider.readFile(path);
  }

  async writeFile(
    user: User,
    fileData: Partial<FsNode>,
    file: UploadedFileData,
  ): Promise<FsNode> {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileHash = this.hashProvider.hashFile(file.buffer);
    const storedHash: Hash = await this.hashRepository.addHash(fileHash);
    await this.fsProvider.writeFile(fileHash, file.buffer);
    const newFile = new FsNode({
      ...fileData,
      path: `${fileData.path}/${storedHash.hash}`,
      mimeType: file.mimetype,
      user: user,
      hash: storedHash,
    });
    return this.filesRepository.createNode(newFile);
  }

  async deleteFile(user: User, path: string): Promise<FsNode> {
    const deletedNode = await this.filesRepository.deleteFileByPath(
      user.id,
      path,
    );

    if (deletedNode.hash === null) return deletedNode;

    if (deletedNode.hash.count === 1) {
      await this.hashRepository.deleteHash(deletedNode.hash.id);
      await this.fsProvider.removeFile(deletedNode.hash.hash);
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
