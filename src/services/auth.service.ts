import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../repositories/auth.repository';
import { User } from 'src/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string): Promise<string> {
    const existingUser = await this.authRepository.findByUsername(email);
    if (existingUser) {
      throw new UnauthorizedException('username already in use');
    }

    const newUser = await this.authRepository.createUser(email, password);

    return this.generateToken(newUser);
  }

  async signIn(email: string, password: string): Promise<string> {
    const user = await this.authRepository.findByUsername(email);
    if (!user || password != user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({ id: user.id, username: user.username });
  }
}
