import { Injectable } from '@nestjs/common';
import {
  mkdir,
  readFile,
  rm,
  writeFile as writeFileInStorage,
} from 'fs/promises';
import { copy } from 'fs-extra';

import { join } from 'path';
import { IFsProvider } from 'src/domain/Interfaces/fsProvider.interface';

@Injectable()
export class FsProvider implements IFsProvider {
  getFullPath(path: string): string {
    return join(process.cwd(), 'assets/', path);
  }

  async createDirectory(username: string, path: string): Promise<string> {
    const directoryPath = this.getFullPath(`${username}/${path}`);
    await mkdir(directoryPath, { recursive: true });
    return directoryPath;
  }

  async deleteDirectory(path: string): Promise<void> {
    const fullPath = this.getFullPath(path);
    await rm(fullPath, { recursive: true, force: true });
  }

  async copyNode(
    username: string,
    path: string,
    newPath: string,
  ): Promise<void> {
    const sourcePath = this.getFullPath(`${username}/${path}`);
    const targetPath = this.getFullPath(
      `${username}/${newPath}/${path.split('/').pop()}`,
    );
    await copy(sourcePath, targetPath);
  }

  async readFile(path: string): Promise<Buffer> {
    const parts = path.split('/');
    const hash = parts[parts.length - 1];
    return await readFile(join('assets/', hash));
  }

  async writeFile(fileHash: string, buffer: Buffer) {
    const filePath = this.getFullPath(fileHash);
    await writeFileInStorage(filePath, buffer);
  }

  async removeFile(hash: string): Promise<string> {
    const fullpath = this.getFullPath(hash);
    await rm(fullpath);
    return hash;
  }
}
