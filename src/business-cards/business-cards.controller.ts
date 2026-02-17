import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BusinessCardsService } from './business-cards.service';
import { CreateBusinessCardDto } from './dto/create-business-card.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('business-cards')
@UseGuards(AuthGuard('jwt'))
export class BusinessCardsController {
    constructor(private readonly businessCardsService: BusinessCardsService) { }

    @Get('admin/all')
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN')
    findAllGlobal() {
        return this.businessCardsService.findAllGlobal();
    }

    @Post('scan')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const dir = join(process.cwd(), 'uploads');
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    scan(@UploadedFile() file: Express.Multer.File) {
        return this.businessCardsService.scan(file);
    }

    @Post()
    create(@Request() req, @Body() createBusinessCardDto: CreateBusinessCardDto) {
        return this.businessCardsService.create(req.user.userId, req.user.organizationId, createBusinessCardDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.businessCardsService.findAll(req.user.organizationId);
    }

    @Get('mine')
    findAllMine(@Request() req) {
        return this.businessCardsService.findAllMine(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.businessCardsService.findOne(id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateBusinessCardDto: any) {
        return this.businessCardsService.update(id, req.user.userId, req.user.role, updateBusinessCardDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.businessCardsService.remove(id, req.user.userId, req.user.role);
    }
}
