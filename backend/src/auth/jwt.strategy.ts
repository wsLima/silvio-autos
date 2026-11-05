import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

function extractFromCookie(req: Request): string | null {
  return (req.cookies?.['access_token'] as string | undefined) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookie]),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? 'dev-secret-change-me',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
