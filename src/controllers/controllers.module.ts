import { Module } from '@nestjs/common';
import { FileSystemController } from './file-system.controller';
import { ServicesModule } from 'src/services/services.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_SECRET } from 'src/constants/auth.constants';

@Module({
  imports: [
    ServicesModule,
    JwtModule.register({
      secret: AUTH_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [FileSystemController, AuthController],
})
export class ControllersModule {}
