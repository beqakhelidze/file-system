import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RepositoriesModule } from './repositories/repositories.module';
import { ServicesModule } from './services/services.module';
import { ProvidersModule } from './providers/providers.module';
import { ControllersModule } from './controllers/controllers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'files-db',
      password: 'files-db',
      database: 'files-db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets'), // Serve files from assets folder
      serveRoot: '/assets', // Accessible at http://localhost:3000/assets/
    }),
    RepositoriesModule,
    ProvidersModule,
    ServicesModule,
    ControllersModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log('✅ Connected to the database successfully');
  }
}
