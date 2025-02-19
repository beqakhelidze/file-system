export interface IFile {
  name: string;
  mimeType: string;
  path: string;
  size: number;
  hash: string;
}

export interface IDirectory {
  name: string;
  path: string;
}
