import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IHashProvider } from 'src/domain/interfaces/hashProvider.interface';

@Injectable()
export class HashProvider implements IHashProvider {
  hashFile(buffer: Buffer): string {
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    return fileHash;
  }
}
