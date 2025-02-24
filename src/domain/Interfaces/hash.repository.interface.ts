import { Hash } from '../entities/hash.entity';

export interface IHashRepository {
  addHash(hash: string): Promise<Hash>;
  deleteHash(id: number): Promise<Hash>;
  modifyHashCount(id: number, newValue: number): Promise<Hash>;
}
