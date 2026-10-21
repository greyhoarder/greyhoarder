import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/api/index.js';
import { AuthenticateService } from './features/authenticate/authenticate.service.js';
import { AuthenticationGuard } from './features/authenticate/guards/authentication.guard.js';
import { SessionController } from './features/session/session.controller.js';
import { SessionService } from './features/session/session.service.js';
import { Argon2PasswordHasher } from './infrastructure/argon2-password-hasher.js';
import { RedisLoginAttempts } from './infrastructure/redis-login-attempts.js';
import { RedisSessionRegistry } from './infrastructure/redis-session-registry.js';
import { LoginAttempts } from './ports/login-attempts.js';
import { PasswordHasher } from './ports/password-hasher.js';
import { SessionRegistry } from './ports/session-registry.js';

/** Passwords, sessions (sign in, sign out) and the global authentication guard (ADR-0007, -0009, -0010). Depends only on users. */
@Module({
  imports: [UsersModule],
  controllers: [SessionController],
  providers: [
    SessionService,
    AuthenticateService,
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: SessionRegistry, useClass: RedisSessionRegistry },
    { provide: LoginAttempts, useClass: RedisLoginAttempts },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
})
export class AuthModule {}
