import { Module } from '@nestjs/common';
import { BusinessCardsController } from './business-cards.controller';
import { BusinessCardsService } from './business-cards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OcrModule } from '../ocr/ocr.module';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule, OcrModule],
  controllers: [BusinessCardsController],
  providers: [BusinessCardsService, RolesGuard],
})
export class BusinessCardsModule {}
