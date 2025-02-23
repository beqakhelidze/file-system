import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/Entities/user.entity';

export interface IAuthRepository {
  findByUsername(username: string): Promise<User | null>;
  createUser(username: string, hashedPassword: string): Promise<User>;
}

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async createUser(username: string, hashedPassword: string): Promise<User> {
    const user = this.userRepo.create({ username, password: hashedPassword });
    return this.userRepo.save(user);
  }
}
