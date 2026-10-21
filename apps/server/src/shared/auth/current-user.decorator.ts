import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from '@greyhoarder/domain/users';
import type { Request } from 'express';

/**
 * The signed-in user, as attached by the session guard. The only way to get
 * the current user; never take it from bodies, parameters or headers (ADR-0010).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | undefined =>
    context.switchToHttp().getRequest<Request>().user,
);

declare module 'express' {
  interface Request {
    user?: User;
  }
}
