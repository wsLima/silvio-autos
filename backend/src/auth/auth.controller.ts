import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { JwtPayload } from './jwt.strategy.js';

const COOKIE_NAME = 'access_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ id: string; email: string; name: string }> {
    const admin = await this.authService.validateCredentials(dto.email, dto.password);
    const token = this.authService.issueToken(admin);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: SEVEN_DAYS_MS,
      path: '/',
    });

    return admin;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { success: true };
  }

  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request): Promise<{ id: string; email: string; name: string } | null> {
    const payload = req.user as JwtPayload;
    return this.authService.getAdminById(payload.sub);
  }
}
