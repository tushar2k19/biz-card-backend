import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AddUserDto } from './dto/add-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async createWithPassword(dto: AddUserDto & { organizationId: string }) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const role = dto.role || 'MEMBER';
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        organizationId: dto.organizationId,
        role,
      },
    });
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findByOrganization(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  updateRole(id: string, role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MEMBER') {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
