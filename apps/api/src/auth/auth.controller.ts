import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
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

  @Get('me')
  me(@Req() req: Request): { role: string } {
    const user = req.user as { role: string };
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
