import { FsNode } from '../entities/file-system.entity';

export interface IFileSystemRepository {
  createNode(node: FsNode): Promise<FsNode>;
  findFileByPath(userId: number, path: string): Promise<FsNode | null>;
  getDirectory(userId: number, path: string): Promise<FsNode[]>;
  getDirectoryById(id: number): Promise<FsNode | null>;
  copyDirectory(
    userId: number,
    path: string,
    newPath: string,
  ): Promise<FsNode[]>;
  deleteNodesByPathPrefix(
    UserId: number,
    pathPrefix: string,
  ): Promise<FsNode[]>;
  deleteFileByPath(userId: number, path: string): Promise<FsNode>;
}
