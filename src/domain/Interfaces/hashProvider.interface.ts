export interface IHashProvider {
  hashFile(buffer: Buffer): string;
}
