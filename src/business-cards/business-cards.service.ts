import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessCardDto } from './dto/create-business-card.dto';
import { OcrService } from '../ocr/ocr.service';
import * as fs from 'fs';

@Injectable()
export class BusinessCardsService {
    constructor(
        private prisma: PrismaService,
        private ocrService: OcrService,
    ) { }

    async scan(file: Express.Multer.File) {
        const buffer = fs.readFileSync(file.path);
        const data = await this.ocrService.processImage(buffer, file.mimetype);
        return {
            extractedData: data,
            imageUrl: `/uploads/${file.filename}`,
        };
    }

    create(userId: string, organizationId: string, createBusinessCardDto: CreateBusinessCardDto) {
        return this.prisma.businessCard.create({
            data: {
                ...createBusinessCardDto,
                userId,
                organizationId,
            },
        });
    }

    findAll(organizationId: string) {
        return this.prisma.businessCard.findMany({
            where: { organizationId },
            include: { user: { select: { id: true, fullName: true, email: true } } },
        });
    }

    findAllMine(userId: string) {
        return this.prisma.businessCard.findMany({
            where: { userId },
            include: { user: { select: { id: true, fullName: true, email: true } } },
        });
    }

    findAllGlobal() {
        return this.prisma.businessCard.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                organization: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    findOne(id: string) {
        return this.prisma.businessCard.findUnique({
            where: { id },
        });
    }

    async update(id: string, userId: string, role: string, updateBusinessCardDto: any) {
        const card = await this.findOne(id);
        if (!card) {
            throw new Error('Card not found');
        }

        if (card.userId !== userId && role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden');
        }

        return this.prisma.businessCard.update({
            where: { id },
            data: updateBusinessCardDto,
        });
    }

    async remove(id: string, userId: string, role: string) {
        const card = await this.findOne(id);
        if (!card) {
            throw new Error('Card not found');
        }

        if (card.userId !== userId && role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden');
        }

        return this.prisma.businessCard.delete({
            where: { id },
        });
    }
}
