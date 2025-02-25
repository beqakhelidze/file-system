import { Test, TestingModule } from '@nestjs/testing';
import { FileSystemService } from './file-system.service';
import { IFileSystemRepository } from 'src/domain/interfaces/files-system.repository.interface';
// import { IHashRepository } from 'src/domain/interfaces/hash.repository.interface';
// import { IFsProvider } from 'src/domain/interfaces/fsProvider.interface';
// import { IHashProvider } from 'src/domain/interfaces/hashProvider.interface';
import { User } from 'src/domain/entities/user.entity';
import { FsNode } from 'src/domain/entities/file-system.entity';
// import { Hash } from 'src/domain/entities/hash.entity';

describe('FileSystemService', () => {
  let service: FileSystemService;
  let filesRepository: jest.Mocked<IFileSystemRepository>;
  // let hashRepository: jest.Mocked<IHashRepository>;
  // let fsProvider: jest.Mocked<IFsProvider>;
  // let hashProvider: jest.Mocked<IHashProvider>;

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
    // hashRepository = module.get('HashRepository1');
    // fsProvider = module.get('FsProvider');
    // hashProvider = module.get('HashProvider');
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
});
