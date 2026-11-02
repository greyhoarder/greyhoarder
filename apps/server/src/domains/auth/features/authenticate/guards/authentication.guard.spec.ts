import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User, UserRole } from '@greyhoarder/domain/users';
import { Roles } from '../../../../../shared/auth/roles.decorator.js';
import type { AuthenticateService } from '../authenticate.service.js';
import { AuthenticationGuard } from './authentication.guard.js';
import { partialFake } from '../../../../../shared/testing/partial-fake.js';

@Roles('admin')
class AccountsOfTheInstance {
  list(): void {}
}

function contextOf(): ExecutionContext {
  const request = { session: { userId: '1' }, sessionID: 's' };

  return partialFake<ExecutionContext>({
    getHandler: () => AccountsOfTheInstance.prototype.list,
    getClass: () => AccountsOfTheInstance,
    switchToHttp: () => ({ getRequest: () => request }),
  });
}

function guardFor(role: UserRole): AuthenticationGuard {
  const user: User = { id: '1', username: 'ben', role, disabled: false };
  const authenticate = { authenticate: vi.fn(async () => user) };

  return new AuthenticationGuard(new Reflector(), partialFake<AuthenticateService>(authenticate));
}

describe('Authentication guard', () => {
  it('refuses a member listing or adding accounts', async () => {
    const guard = guardFor('member');

    const access = guard.canActivate(contextOf());

    await expect(access).rejects.toThrow(ForbiddenException);
  });

  it('refuses a member changing an account', async () => {
    const guard = guardFor('member');

    const access = guard.canActivate(contextOf());

    await expect(access).rejects.toThrow(ForbiddenException);
  });

  it('lets an administrator through', async () => {
    const guard = guardFor('admin');

    const access = await guard.canActivate(contextOf());

    expect(access).toBe(true);
  });
});
