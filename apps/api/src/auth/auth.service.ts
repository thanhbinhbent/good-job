import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export type AdminPayload = { sub: 'admin'; role: 'admin' };
export type SharePayload = { sub: string; shareId: string; role: 'share' };

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  validateAdminEmail(email: string): boolean {
    const allowed = this.config
      .getOrThrow<string>('ADMIN_EMAILS')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    return allowed.includes(email.toLowerCase());
  }

  signAdminToken(): string {
    const payload: AdminPayload = { sub: 'admin', role: 'admin' };
    return this.jwt.sign(payload);
  }

  signShareToken(shareId: string): string {
    const payload: SharePayload = { sub: shareId, shareId, role: 'share' };
    return this.jwt.sign(payload, { expiresIn: '1h' });
  }

  verifyToken<T extends object>(token: string): T {
    try {
      return this.jwt.verify<T>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
