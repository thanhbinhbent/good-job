import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

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

  /**
   * DEV ONLY — auto-login as admin without Google OAuth.
   * Only available when ADMIN_BYPASS=true and NODE_ENV !== production.
   */
  @Public()
  @Get('dev-login')
  devLogin(@Res() res: Response): void {
    const isBypass =
      process.env.ADMIN_BYPASS === 'true' &&
      process.env.NODE_ENV !== 'production';

    if (!isBypass) {
      res.status(403).json({ error: 'Dev login is disabled in production' });
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

  @Get('me')
  me(@Req() req: Request): { role: string } {
    const user = req.user as { role: string } | undefined;
    if (!user) return { role: 'guest' };
    return { role: user.role };
  }

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
