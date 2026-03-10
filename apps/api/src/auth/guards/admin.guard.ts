import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AdminPayload } from '../auth.service';

/** When ADMIN_BYPASS=true (dev only), skip all JWT validation and inject a fake admin. */
const isBypassEnabled = (): boolean =>
  process.env.ADMIN_BYPASS === 'true' && process.env.NODE_ENV !== 'production';

/** Extra defense: bypass is only valid for requests originating from localhost. */
function isLocalhostRequest(req: Request): boolean {
  const ip =
    (req as Request & { ip?: string }).ip ?? req.socket?.remoteAddress ?? '';
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
}

@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (isBypassEnabled()) {
      const req = context.switchToHttp().getRequest<Request>();
      if (!isLocalhostRequest(req)) {
        throw new UnauthorizedException(
          'Bypass mode only accessible from localhost',
        );
      }
      const fakeAdmin: AdminPayload = { sub: 'admin', role: 'admin' };
      (req as Request & { user: AdminPayload }).user = fakeAdmin;
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest<T extends { role: string }>(err: unknown, user: T | false): T {
    if (err || !user) throw new UnauthorizedException('Admin access required');
    if (user.role !== 'admin')
      throw new UnauthorizedException('Admin access required');
    return user;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  handleRequest<T extends object>(
    err: unknown,
    user: T | false,
    _info: unknown,
    context: ExecutionContext,
  ): T {
    const req = context.switchToHttp().getRequest<Request>();
    const shareToken = (req.headers['x-share-token'] as string) ?? '';
    if (shareToken && !err && user) return user;
    if (err || !user) throw new UnauthorizedException();
    return user;
  }
}
