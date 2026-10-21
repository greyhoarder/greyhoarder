import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { destroySession } from '../../../util/express-session.js';
import { IS_PUBLIC } from '../../../../../shared/auth/public.decorator.js';
import { AuthenticateService } from '../authenticate.service.js';
import { SessionInvalidError } from '../errors/session-invalid.error.js';

/** Global guard: every endpoint needs a valid session unless marked `@Public()` (ADR-0010). */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authenticate: AuthenticateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { userId } = request.session;
    if (!userId) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.authenticate.authenticate(userId, request.sessionID);
      return true;
    } catch (error) {
      if (!(error instanceof SessionInvalidError)) {
        throw error;
      }
      await this.authenticate.endSession(userId, request.sessionID);
      await destroySession(request);
      throw new UnauthorizedException();
    }
  }
}
