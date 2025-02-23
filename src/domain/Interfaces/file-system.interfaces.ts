export interface IFsProvider {
  getFullPath(path: string): string;
  createDirectory(path: string): Promise<string>;
  deleteDirectory(path: string): Promise<void>;
  writeFile(fileHash: string, buffer: Buffer): Promise<void>;
  removeFile(fileHash): Promise<string>;
}
export interface IHashProvider {
  hashFile(buffer: Buffer): string;
}
