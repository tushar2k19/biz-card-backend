import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { AddUserDto } from './dto/add-user.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('SUPER_ADMIN', 'ORG_ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Request() req, @Body() addUserDto: AddUserDto) {
    let organizationId: string;
    if (req.user.role === 'SUPER_ADMIN') {
      if (!addUserDto.organizationId) {
        throw new BadRequestException('organizationId is required for super admin');
      }
      organizationId = addUserDto.organizationId;
    } else {
      organizationId = req.user.organizationId;
    }
    return this.usersService.createWithPassword({
      ...addUserDto,
      organizationId,
    });
  }

  @Get()
  async findByOrganization(@Request() req, @Query('organizationId') organizationId?: string) {
    if (req.user.role === 'SUPER_ADMIN') {
      if (!organizationId) {
        throw new BadRequestException('organizationId query is required for super admin');
      }
      return this.usersService.findByOrganization(organizationId);
    }
    if (req.user.role === 'ORG_ADMIN') {
      return this.usersService.findByOrganization(req.user.organizationId);
    }
    throw new ForbiddenException();
  }
}
