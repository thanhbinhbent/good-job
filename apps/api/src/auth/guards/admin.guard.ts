import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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
