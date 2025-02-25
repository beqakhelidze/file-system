import { Test, TestingModule } from '@nestjs/testing';
import { FileSystemService } from './file-system.service';
import { IFileSystemRepository } from 'src/domain/interfaces/files-system.repository.interface';
import { User } from 'src/domain/entities/user.entity';
import { FsNode } from 'src/domain/entities/file-system.entity';
import { IHashRepository } from 'src/domain/interfaces/hash.repository.interface';
import { IFsProvider } from 'src/domain/interfaces/fsProvider.interface';
import { Hash } from 'src/domain/entities/hash.entity';

describe('FileSystemService', () => {
  let service: FileSystemService;
  let filesRepository: jest.Mocked<IFileSystemRepository>;
  let hashRepository: jest.Mocked<IHashRepository>;
  let fsProvider: jest.Mocked<IFsProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileSystemService,
        {
          provide: 'FilesSystemRepository',
          useValue: {
            getDirectory: jest.fn(),
            createNode: jest.fn(),
            deleteNodesByPathPrefix: jest.fn(),
            copyDirectory: jest.fn(),
            findFileByPath: jest.fn(),
            deleteFileByPath: jest.fn(),
          },
        },
        {
          provide: 'HashRepository1',
          useValue: {
            deleteHash: jest.fn(),
            modifyHashCount: jest.fn(),
            addHash: jest.fn(),
          },
        },
        {
          provide: 'FsProvider',
          useValue: {
            createDirectory: jest.fn(),
            deleteDirectory: jest.fn(),
            copyNode: jest.fn(),
            readFile: jest.fn(),
            writeFile: jest.fn(),
            removeFile: jest.fn(),
          },
        },
        {
          provide: 'HashProvider',
          useValue: {
            hashFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileSystemService>(FileSystemService);
    filesRepository = module.get('FilesSystemRepository');
    hashRepository = module.get('HashRepository1');
    fsProvider = module.get('FsProvider');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDirectory', () => {
    it('should return directory contents', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder';
      const expectedFiles: FsNode[] = [{ id: 1, name: 'file1' }] as FsNode[];

      filesRepository.getDirectory.mockResolvedValue(expectedFiles);

      const result = await service.getDirectory(user, path);
      expect(result).toEqual(expectedFiles);
      expect(filesRepository.getDirectory).toHaveBeenCalledWith(user.id, path);
    });
  });

  describe('createDirectory', () => {
    it('should create a new directory', async () => {
      const user = new User();
      user.username = 'testUser';
      const directoryData = { name: 'newFolder', path: 'parentFolder' };
      const expectedNode = new FsNode({
        ...directoryData,
        path: `${directoryData.path}/${directoryData.name}`,
        createdBy: user.username,
        user: user,
      });

      fsProvider.createDirectory.mockResolvedValue('test-path');
      filesRepository.createNode.mockResolvedValue(expectedNode);

      const result = await service.createDirectory(user, directoryData);

      expect(result).toEqual(expectedNode);
      expect(fsProvider.createDirectory).toHaveBeenCalledWith(
        `${user.username}/${directoryData.path}/${directoryData.name}`,
      );
      expect(filesRepository.createNode).toHaveBeenCalledWith(expectedNode);
    });
  });

  describe('deleteDirectory', () => {
    it('should delete a directory and manage hashes correctly', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder';
      const nodesToDelete: FsNode[] = [
        { hash: new Hash({ id: 1, count: 2 }) } as FsNode,
        { hash: new Hash({ id: 2, count: 1 }) } as FsNode,
      ];

      filesRepository.deleteNodesByPathPrefix.mockResolvedValue(nodesToDelete);
      hashRepository.deleteHash.mockResolvedValue(new Hash({ id: 1 }));
      hashRepository.modifyHashCount.mockResolvedValue(new Hash({ id: 2 }));
      fsProvider.deleteDirectory.mockResolvedValue(undefined);

      await service.deleteDirectory(user, path);

      expect(filesRepository.deleteNodesByPathPrefix).toHaveBeenCalledWith(
        user.id,
        path,
      );
      expect(hashRepository.deleteHash).toHaveBeenCalledWith(2);
      expect(hashRepository.modifyHashCount).toHaveBeenCalledWith(1, 1);
      expect(fsProvider.deleteDirectory).toHaveBeenCalledWith(path);
    });
  });

  describe('copyDirectory', () => {
    it('should copy a directory and update hash counts correctly', async () => {
      const user = new User();
      user.username = 'testUser';
      const path = 'source-folder';
      const newPath = 'destination-folder';

      const nodesToDuplicate: FsNode[] = [
        Object.assign(new FsNode({ hash: new Hash({ id: 1, count: 2 }) })),
        Object.assign(new FsNode({ hash: new Hash({ id: 2, count: 3 }) })),
        Object.assign(new FsNode({ hash: new Hash({ id: 1, count: 2 }) })),
      ];

      fsProvider.copyNode.mockResolvedValue(undefined);
      filesRepository.copyDirectory.mockResolvedValue(nodesToDuplicate);
      hashRepository.modifyHashCount.mockResolvedValue(new Hash({}));

      const result = await service.copyDirectory(user, path, newPath);

      expect(fsProvider.copyNode).toHaveBeenCalledWith(
        `${user.username}/${path}`,
        `${user.username}/${newPath}`,
      );
      expect(filesRepository.copyDirectory).toHaveBeenCalledWith(
        user.id,
        path,
        newPath,
      );

      expect(hashRepository.modifyHashCount).toHaveBeenCalledTimes(2);
      expect(hashRepository.modifyHashCount).toHaveBeenCalledWith(1, 4);
      expect(hashRepository.modifyHashCount).toHaveBeenCalledWith(2, 2);

      expect(result).toEqual({ message: 'Directory copied successfully' });
    });
  });

  describe('moveDirectory', () => {
    it('should copy and then delete a directory', async () => {
      const user = new User();
      user.username = 'testUser';
      const path = 'source-folder';
      const newPath = 'destination-folder';

      jest
        .spyOn(service, 'copyDirectory')
        .mockResolvedValue({ message: 'Directory copied successfully' });
      jest.spyOn(service, 'deleteDirectory').mockResolvedValue(undefined);

      const result = await service.moveDirectory(user, path, newPath);

      expect(service.copyDirectory).toHaveBeenCalledWith(user, path, newPath);
      expect(service.deleteDirectory).toHaveBeenCalledWith(user, path);
      expect(result).toEqual({ message: 'Directory moved successfully' });
    });
  });

  describe('readFile', () => {
    it('should read a file and return its content as a buffer', async () => {
      const path = 'test-folder/test-file.txt';
      const fileContent = Buffer.from('Test file content');

      fsProvider.readFile.mockResolvedValue(fileContent);

      const result = await service.readFile(path);

      expect(fsProvider.readFile).toHaveBeenCalledWith(path);
      expect(result).toEqual(fileContent);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file and return the deleted node when no hash is present', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/test-file.txt';

      const deletedNode: FsNode = { hash: null } as FsNode;

      filesRepository.deleteFileByPath.mockResolvedValue(deletedNode);

      const result = await service.deleteFile(user, path);

      expect(filesRepository.deleteFileByPath).toHaveBeenCalledWith(
        user.id,
        path,
      );
      expect(result).toEqual(deletedNode);
      expect(hashRepository.deleteHash).not.toHaveBeenCalled();
      expect(fsProvider.removeFile).not.toHaveBeenCalled();
      expect(hashRepository.modifyHashCount).not.toHaveBeenCalled();
    });

    it('should delete the hash and remove the file if hash count is 1', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/test-file.txt';

      const deletedNode: FsNode = {
        hash: new Hash({ id: 1, hash: 'file-hash', count: 1 }),
      } as FsNode;

      filesRepository.deleteFileByPath.mockResolvedValue(deletedNode);
      hashRepository.deleteHash.mockResolvedValue(new Hash({}));
      fsProvider.removeFile.mockResolvedValue('test-path');

      const result = await service.deleteFile(user, path);

      expect(filesRepository.deleteFileByPath).toHaveBeenCalledWith(
        user.id,
        path,
      );
      expect(hashRepository.deleteHash).toHaveBeenCalledWith(1);
      expect(fsProvider.removeFile).toHaveBeenCalledWith('file-hash');
      expect(result).toEqual(deletedNode);
    });

    it('should modify the hash count if hash count is greater than 1', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/test-file.txt';

      const deletedNode: FsNode = {
        hash: new Hash({ id: 2, count: 3 }),
      } as FsNode;

      filesRepository.deleteFileByPath.mockResolvedValue(deletedNode);
      hashRepository.modifyHashCount.mockResolvedValue(new Hash({}));

      const result = await service.deleteFile(user, path);

      expect(filesRepository.deleteFileByPath).toHaveBeenCalledWith(
        user.id,
        path,
      );
      expect(hashRepository.modifyHashCount).toHaveBeenCalledWith(2, 2);
      expect(fsProvider.removeFile).not.toHaveBeenCalled();
      expect(result).toEqual(deletedNode);
    });
  });

  describe('copyFile', () => {
    it('should copy a file successfully', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/test-file.txt';
      const newPath = 'new-folder';

      const fileToCopy: FsNode = {
        id: 10,
        path: path,
        hash: new Hash({ id: 2, hash: 'file-hash' }),
      } as FsNode;

      const newFile: Partial<FsNode> = {
        ...fileToCopy,
        id: undefined,
        path: `${newPath}/${fileToCopy.hash?.hash}`,
      };

      filesRepository.findFileByPath.mockResolvedValue(fileToCopy);
      filesRepository.createNode.mockResolvedValue(newFile as FsNode);

      const result = await service.copyFile(user, path, newPath);

      expect(filesRepository.findFileByPath).toHaveBeenCalledWith(
        user.id,
        path,
      );
      expect(filesRepository.createNode).toHaveBeenCalledWith(newFile);
      expect(result).toEqual(newFile);
    });

    it('should throw an error if the file does not exist', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/missing-file.txt';
      const newPath = 'new-folder';

      filesRepository.findFileByPath.mockResolvedValue(null);

      await expect(service.copyFile(user, path, newPath)).rejects.toThrow(
        "Can't find file",
      );

      expect(filesRepository.findFileByPath).toHaveBeenCalledWith(
        user.id,
        path,
      );
      expect(filesRepository.createNode).not.toHaveBeenCalled();
    });
  });

  describe('moveFile', () => {
    it('should move a file successfully', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/test-file.txt';
      const newPath = 'new-folder/test-file.txt';

      const copiedFile = { id: 10, path: newPath } as FsNode;
      const deletedFile = { id: 10, path: path } as FsNode;

      jest.spyOn(service, 'copyFile').mockResolvedValue(copiedFile);
      jest.spyOn(service, 'deleteFile').mockResolvedValue(deletedFile);

      const result = await service.moveFile(user, path, newPath);

      expect(service.copyFile).toHaveBeenCalledWith(user, path, newPath);
      expect(service.deleteFile).toHaveBeenCalledWith(user, path);
      expect(result).toEqual({ message: 'Directory moved successfully' });
    });

    it('should throw an error if copyFile fails', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/test-file.txt';
      const newPath = 'new-folder/test-file.txt';

      jest
        .spyOn(service, 'copyFile')
        .mockRejectedValue(new Error('Copy failed'));
      jest.spyOn(service, 'deleteFile');

      await expect(service.moveFile(user, path, newPath)).rejects.toThrow(
        'Copy failed',
      );

      expect(service.copyFile).toHaveBeenCalledWith(user, path, newPath);
      expect(service.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw an error if deleteFile fails', async () => {
      const user = new User();
      user.id = 1;
      const path = 'test-folder/test-file.txt';
      const newPath = 'new-folder/test-file.txt';

      const copiedFile = { id: 10, path: newPath } as FsNode;

      jest.spyOn(service, 'copyFile').mockResolvedValue(copiedFile);
      jest
        .spyOn(service, 'deleteFile')
        .mockRejectedValue(new Error('Delete failed'));

      await expect(service.moveFile(user, path, newPath)).rejects.toThrow(
        'Delete failed',
      );

      expect(service.copyFile).toHaveBeenCalledWith(user, path, newPath);
      expect(service.deleteFile).toHaveBeenCalledWith(user, path);
    });
  });
});
