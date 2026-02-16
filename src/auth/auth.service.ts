import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private organizationsService: OrganizationsService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role, organizationId: user.organizationId };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findOne(userId);
        if (!user) return null;
        const { passwordHash, ...rest } = user;
        return rest;
    }

    async register(registerDto: RegisterDto) {
        // 1. Create Organization
        const org = await this.organizationsService.create({
            name: registerDto.organizationName,
            slug: registerDto.organizationSlug,
        });

        // 2. Hash Password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        // 3. Create User
        const user = await this.usersService.create({
            email: registerDto.email,
            passwordHash: passwordHash,
            fullName: registerDto.fullName,
            organizationId: org.id,
        });

        // 4. Set first user of org as ORG_ADMIN so they can add members
        await this.usersService.updateRole(user.id, 'ORG_ADMIN');
        const { passwordHash: _, ...rest } = user;
        return this.login({ ...rest, role: 'ORG_ADMIN' });
    }
}
