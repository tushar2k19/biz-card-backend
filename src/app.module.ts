import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuthModule } from './auth/auth.module';
import { BusinessCardsModule } from './business-cards/business-cards.module';
import { OcrModule } from './ocr/ocr.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Use cwd/uploads so it matches Multer destination (files are served from where they're saved).
const uploadsDir = join(process.cwd(), 'uploads');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: uploadsDir,
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UsersModule,
    OrganizationsModule,
    AuthModule,
    BusinessCardsModule,
    OcrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
