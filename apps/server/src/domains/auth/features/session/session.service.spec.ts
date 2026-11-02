import { changePasswordRequestSchema } from '@greyhoarder/protocol/auth';
import type { User } from '@greyhoarder/domain/users';
import type { AccountsService } from '../../../users/api/index.js';
import type { LoginAttempts } from '../../ports/login-attempts.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { SessionRegistry } from '../../ports/session-registry.js';
import { InvalidCredentialsError } from './errors/invalid-credentials.error.js';
import { TooManyLoginAttemptsError } from './errors/too-many-login-attempts.error.js';
import { SessionService } from './session.service.js';
import { partialFake } from '../../../../shared/testing/partial-fake.js';

const MIRA: User = { id: 'mira-id', username: 'mira', role: 'admin', disabled: false };

function serviceWith({ lockedForMs = 0 } = {}) {
  const accounts = {
    findCredentials: vi.fn(async () => ({ user: MIRA, passwordHash: 'stored' })),
    changePasswordHash: vi.fn(async () => undefined),
    recordLogin: vi.fn(async () => undefined),
  };

  const passwords = {
    hash: vi.fn(async (password: string) => `hash of ${password}`),
    verify: vi.fn(async (_hash: string, password: string) => password === 'right'),
    spendVerificationTime: vi.fn(async () => undefined),
  };

  const attempts = {
    lockedForMs: vi.fn(async () => lockedForMs),
    recordFailure: vi.fn(async () => 1),
    reset: vi.fn(async () => undefined),
  };

  const sessions = { add: vi.fn(async () => undefined), keepOnly: vi.fn(async () => undefined) };

  const service = new SessionService(
    partialFake<AccountsService>(accounts),
    partialFake<PasswordHasher>(passwords),
    partialFake<LoginAttempts>(attempts),
    partialFake<SessionRegistry>(sessions),
  );

  return { service, accounts, sessions };
}

describe('Sessions', () => {
  it('records the moment of signing in', async () => {
    const { service, accounts } = serviceWith();

    await service.startSession(MIRA.id, 'this-session');

    expect(accounts.recordLogin).toHaveBeenCalledWith(MIRA.id);
  });

  it('refuses a disabled account signing in', async () => {
    const { service, accounts } = serviceWith();
    accounts.findCredentials.mockResolvedValue({ user: { ...MIRA, disabled: true }, passwordHash: 'stored' });

    const verify = service.verify(MIRA.username, 'right', '127.0.0.1');

    await expect(verify).rejects.toThrow(InvalidCredentialsError);
  });

  it('changes the password and keeps only this session', async () => {
    const { service, accounts, sessions } = serviceWith();

    await service.changePassword(MIRA, 'this-session', 'right', 'new one');

    expect(accounts.changePasswordHash).toHaveBeenCalledWith(MIRA.id, 'hash of new one');
    expect(sessions.keepOnly).toHaveBeenCalledWith(MIRA.id, 'this-session');
  });

  it('refuses a wrong current password', async () => {
    const { service, accounts, sessions } = serviceWith();

    const change = service.changePassword(MIRA, 'this-session', 'wrong', 'new one');

    await expect(change).rejects.toThrow(InvalidCredentialsError);
    expect(accounts.changePasswordHash).not.toHaveBeenCalled();
    expect(sessions.keepOnly).not.toHaveBeenCalled();
  });

  it('pauses after too many wrong passwords', async () => {
    const { service, accounts } = serviceWith({ lockedForMs: 1000 });

    const change = service.changePassword(MIRA, 'this-session', 'right', 'new one');

    await expect(change).rejects.toThrow(TooManyLoginAttemptsError);
    expect(accounts.changePasswordHash).not.toHaveBeenCalled();
  });

  it('refuses an empty new password', () => {
    const request = changePasswordRequestSchema.safeParse({ currentPassword: 'right', newPassword: '' });

    expect(request.success).toBe(false);
  });

  it('signs out the other devices, not this one', async () => {
    const { service, sessions } = serviceWith();

    await service.endOtherSessions(MIRA.id, 'this-session');

    expect(sessions.keepOnly).toHaveBeenCalledWith(MIRA.id, 'this-session');
  });
});
