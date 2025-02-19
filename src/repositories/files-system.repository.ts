import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FsNode } from '../domain/Entities/file-system.entity';
import { IDirectory } from '../domain/Interfaces/file-system.interfaces';

export interface IFileSystemRepository {
  createNode(fileData: IDirectory): Promise<FsNode>;
  getDirectories(): Promise<FsNode[]>;
  deleteNodesByPathPrefix(pathPrefix: string): Promise<FsNode[]>;
  deleteNode(id: number): Promise<FsNode>;
}

@Injectable()
export class FilesSystemRepository implements IFileSystemRepository {
  constructor(
    @InjectRepository(FsNode)
    private fileRepository: Repository<FsNode>,
  ) {}

  async createNode(newNode: FsNode): Promise<FsNode> {
    try {
      return await this.fileRepository.save(newNode);
    } catch (error) {
      console.error('Error saving file path to database:', error);
      throw new Error('Error saving file to database');
    }
  }

  async getDirectories(): Promise<FsNode[]> {
    try {
      return await this.fileRepository.find(); // Retrieves all file records
    } catch (error) {
      console.error('Error fetching all files from database:', error);
      throw new Error('Error fetching files from database');
    }
  }

  async deleteNodesByPathPrefix(pathPrefix: string): Promise<FsNode[]> {
    const nodesToDelete = await this.fileRepository.find({
      where: { path: Like(`${pathPrefix}%`) },
      relations: ['hash'],
    });

    await this.fileRepository
      .createQueryBuilder()
      .delete()
      .where('path LIKE :pathPrefix', { pathPrefix: `${pathPrefix}%` }) // Matches all subdirectories and files
      .execute();

    return nodesToDelete;
  }

  async deleteNode(id: number): Promise<FsNode> {
    const nodeToDelete = await this.fileRepository.findOne({
      where: { id },
      relations: ['hash'],
    });

    if (!nodeToDelete) {
      throw new Error("can't find node");
    }

    await this.fileRepository.remove(nodeToDelete);

    return nodeToDelete;
  }
}
