import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hash } from '../domain/Entities/hash.entity';

export interface IHashRepository {
  addHash(hash: string): Promise<Hash>;
  decreaseOrDeleteHash(hash: Hash): Promise<Hash>;
}

@Injectable()
export class HashRepository implements IHashRepository {
  constructor(
    @InjectRepository(Hash)
    private readonly hashRepository: Repository<Hash>,
  ) {}
  async addHash(hash: string): Promise<Hash> {
    let existingHash = await this.hashRepository.findOne({
      where: { hash: hash },
    });

    if (!existingHash) {
      existingHash = this.hashRepository.create({ hash: hash, count: 1 });
      await this.hashRepository.save(existingHash);
    } else {
      existingHash.count += 1;
      await this.hashRepository.save(existingHash);
    }

    return existingHash;
  }

  async decreaseOrDeleteHash(fileHash: Hash): Promise<Hash> {
    if (fileHash.count <= 1) {
      await this.hashRepository.delete(fileHash.id); // Delete the hash
    } else {
      await this.hashRepository.update(fileHash.id, {
        count: fileHash.count - 1,
      }); // Decrease the count
    }

    return fileHash;
  }
}
