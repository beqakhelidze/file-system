import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  createUser(username: string, hashedPassword: string): Promise<User>;
}
