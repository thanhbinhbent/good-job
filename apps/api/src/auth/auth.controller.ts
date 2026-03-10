import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AdminGuard } from './guards/admin.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {
    // Passport handles redirect
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    const token = this.auth.signAdminToken();
    const frontendUrl = this.config.get<string>(
      'SHARE_BASE_URL',
      'http://localhost:5173',
    );
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.redirect(`${frontendUrl}/admin`);
  }

  @Public()
  @Get('dev-login')
  devLogin(@Req() req: Request, @Res() res: Response): void {
    const isBypass =
      process.env.ADMIN_BYPASS === 'true' &&
      process.env.NODE_ENV !== 'production';

    if (!isBypass) {
      res.status(403).json({ error: 'Dev login is disabled' });
      return;
    }

    // Restrict to localhost — prevents exploitation if flags are misconfigured on a remote server
    const ip = (req as Request & { ip?: string }).ip ?? req.socket?.remoteAddress ?? '';
    const isLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
    if (!isLocal) {
      this.logger.error(`dev-login blocked for remote IP ${ip}`);
      res.status(403).json({ error: 'Dev login only accessible from localhost' });
      return;
    }

    this.logger.warn('⚠️  ADMIN_BYPASS active — dev login used (never enable in production)');

    const token = this.auth.signAdminToken();
    const frontendUrl = this.config.get<string>('SHARE_BASE_URL', 'http://localhost:5173');
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.redirect(`${frontendUrl}/admin`);
  }

  /** Returns the correct admin login URL — /auth/dev-login when ADMIN_BYPASS=true, /auth/google otherwise. */
  @Public()
  @Get('login-url')
  loginUrl(): { url: string } {
    const isBypass =
      process.env.ADMIN_BYPASS === 'true' &&
      process.env.NODE_ENV !== 'production';

    if (isBypass) {
      const port = process.env.PORT ?? '3000';
      return { url: `http://localhost:${port}/api/v1/auth/dev-login` };
    }

    // Derive API base from GOOGLE_CALLBACK_URL so it works in any environment
    const callbackUrl = this.config.get<string>(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:3000/api/v1/auth/google/callback',
    );
    const apiBase = callbackUrl.replace('/auth/google/callback', '');
    return { url: `${apiBase}/auth/google` };
  }

  @UseGuards(AdminGuard)
  @Get('me')
  me(@Req() req: Request): { role: string } {
    const user = req.user as { role: string } | undefined;
    if (!user) return { role: 'guest' };
    return { role: user.role };
  }

  @Public()
  @Get('logout')
  logout(@Res() res: Response): void {
    res.clearCookie('access_token');
    const frontendUrl = this.config.get<string>(
      'SHARE_BASE_URL',
      'http://localhost:5173',
    );
    res.redirect(frontendUrl);
  }
}
