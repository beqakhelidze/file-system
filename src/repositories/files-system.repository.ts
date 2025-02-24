import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FsNode } from '../domain/entities/file-system.entity';
import { IFileSystemRepository } from 'src/domain/interfaces/files-system.repository.interface';

@Injectable()
export class FilesSystemRepository implements IFileSystemRepository {
  constructor(
    @InjectRepository(FsNode)
    private fileRepository: Repository<FsNode>,
  ) {}

  async createNode(newNode: FsNode): Promise<FsNode> {
    return this.fileRepository.save(newNode);
  }

  async findFileByPath(userId: number, path: string): Promise<FsNode | null> {
    const fsNode = await this.fileRepository.findOne({
      where: { path, user: { id: userId } },
      relations: ['hash', 'user'],
    });

    return fsNode;
  }

  async getDirectory(userId: number, path: string): Promise<FsNode[]> {
    return this.fileRepository
      .createQueryBuilder('fsNode')
      .where('fsNode.userId = :userId', { userId: userId })
      .andWhere(
        `(fsNode.path ~* :regexPattern) AND (fsNode.path NOT LIKE :excludePattern)`,
        {
          regexPattern: path === '/' ? `^/[^/]+$` : `^${path}/[^/]+$`,
          excludePattern: `'%/%/%'`,
        },
      )
      .orderBy('fsNode.path', 'ASC')
      .getMany();
  }

  async getDirectoryById(id: number): Promise<FsNode | null> {
    const directory = await this.fileRepository.findOne({
      where: { id },
      relations: ['hash'],
    });

    return directory;
  }

  async copyDirectory(
    userId: number,
    path: string,
    newPath: string,
  ): Promise<FsNode[]> {
    const nodesToCopy = await this.fileRepository.find({
      where: [
        { path: Like(`${path}`), user: { id: userId } },
        { path: Like(`${path}/%`), user: { id: userId } },
      ],
      relations: ['hash', 'user'],
    });

    if (!nodesToCopy.length) {
      throw new Error('No directories found to copy');
    }

    const duplicatedNodes = nodesToCopy.map(({ path: oldPath, ...node }) => ({
      ...node,
      path: newPath + oldPath,
    }));

    await this.fileRepository.insert(duplicatedNodes);

    return duplicatedNodes;
  }

  async deleteNodesByPathPrefix(
    userId: number,
    pathPrefix: string,
  ): Promise<FsNode[]> {
    const nodesToDelete = await this.fileRepository.find({
      where: [
        { path: Like(pathPrefix), user: { id: userId } },
        { path: Like(`${pathPrefix}/%`), user: { id: userId } },
      ],
      relations: ['hash'],
    });

    await this.fileRepository.delete({
      user: { id: userId },
      path: Like(`${pathPrefix}%`),
    });

    return nodesToDelete;
  }

  async deleteFileByPath(userId: number, path: string): Promise<FsNode> {
    const nodeToDelete = await this.fileRepository.findOne({
      where: { path: path, user: { id: userId } },
      relations: ['hash'],
    });

    if (!nodeToDelete) {
      throw new Error("can't find node");
    }

    await this.fileRepository.remove(nodeToDelete);

    return nodeToDelete;
  }
}
