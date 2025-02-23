export interface IFsProvider {
  getFullPath(path: string): string;
  createDirectory(username: string, path: string): Promise<string>;
  deleteDirectory(path: string): Promise<void>;
  copyNode(username: string, path: string, newPath: string): Promise<void>;
  writeFile(fileHash: string, buffer: Buffer): Promise<void>;
  removeFile(fileHash): Promise<string>;
  readFile(hash: string): Promise<Buffer>;
}
