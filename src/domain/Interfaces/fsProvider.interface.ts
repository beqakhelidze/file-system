export interface IFsProvider {
  getFullPath(path: string): string;
  createDirectory(path: string): Promise<string>;
  deleteDirectory(path: string): Promise<void>;
  copyNode(path: string, newPath: string): Promise<void>;
  writeFile(fileHash: string, buffer: Buffer): Promise<void>;
  removeFile(fileHash: string): Promise<string>;
  readFile(hash: string): Promise<Buffer>;
}
