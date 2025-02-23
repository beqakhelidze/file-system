import { Module } from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { ProvidersModule } from 'src/providers/providers.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_SECRET } from 'src/Constants/auth.constants';
@Module({
  imports: [
    JwtModule.register({
      secret: AUTH_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    RepositoriesModule,
    ProvidersModule,
  ],
  providers: [FileSystemService, AuthService],
  exports: [FileSystemService, AuthService],
})
export class ServicesModule {}
