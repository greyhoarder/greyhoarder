import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User, UserRole } from '@greyhoarder/domain/users';
import type { Request } from 'express';
import { destroySession } from '../../../util/express-session.js';
import { IS_PUBLIC } from '../../../../../shared/auth/public.decorator.js';
import { REQUIRED_ROLES } from '../../../../../shared/auth/roles.decorator.js';
import { AuthenticateService } from '../authenticate.service.js';
import { SessionInvalidError } from '../errors/session-invalid.error.js';

/** Global guard: every endpoint needs a valid session unless marked `@Public()`, and the role `@Roles()` asks for (ADR-0010). */
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
    } catch (error) {
      if (!(error instanceof SessionInvalidError)) {
        throw error;
      }
      await this.authenticate.endSession(userId, request.sessionID);
      await destroySession(request);
      throw new UnauthorizedException();
    }
    this.assertRole(context, request.user);
    return true;
  }

  private assertRole(context: ExecutionContext, user: User): void {
    const roles = this.reflector.getAllAndOverride<readonly UserRole[] | undefined>(REQUIRED_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles !== undefined && !roles.includes(user.role)) {
      throw new ForbiddenException();
    }
  }
}
