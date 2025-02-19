import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IHashRepository } from '../repositories/hash.repository';
import { Hash } from '../domain/Entities/hash.entity';

@Injectable()
export class HashService {
  constructor(
    @Inject('HashRepository')
    private readonly hashRepository: IHashRepository,
  ) {}

  async getOrCreateFileHash(buffer: Buffer): Promise<Hash> {
    // Generate file hash
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    return this.hashRepository.addHash(fileHash);
  }
}
