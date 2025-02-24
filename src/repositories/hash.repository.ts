import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hash } from '../domain/entities/hash.entity';
import { IHashRepository } from 'src/domain/interfaces/hash.repository.interface';

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

  async deleteHash(id: number): Promise<Hash> {
    const hashToDelete = await this.hashRepository.findOne({ where: { id } });

    if (!hashToDelete) {
      throw new Error(`Hash with ID ${id} not found`);
    }

    await this.hashRepository.delete(id);
    return hashToDelete;
  }

  async modifyHashCount(id: number, newValue: number): Promise<Hash> {
    const hashToModify = await this.hashRepository.findOne({
      where: { id: id },
    });

    if (!hashToModify) {
      throw new Error(`Hash with ID ${id} not found`);
    }

    hashToModify.count = newValue;

    await this.hashRepository.save(hashToModify);

    return hashToModify;
  }
}
