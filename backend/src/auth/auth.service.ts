import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(email: string, password: string): Promise<AuthenticatedAdmin> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return { id: admin.id, email: admin.email, name: admin.name };
  }

  issueToken(admin: AuthenticatedAdmin): string {
    return this.jwtService.sign({ sub: admin.id, email: admin.email, name: admin.name });
  }

  async getAdminById(id: string): Promise<AuthenticatedAdmin | null> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) return null;
    return { id: admin.id, email: admin.email, name: admin.name };
  }
}
