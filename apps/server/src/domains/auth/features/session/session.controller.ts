import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@greyhoarder/domain/users';
import { type SessionResponse, sessionResponseSchema } from '@greyhoarder/protocol/auth';
import type { Request, Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import { AppConfig } from '../../../../config/app-config.js';
import { destroySession, regenerateSession, SESSION_COOKIE } from '../../util/express-session.js';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { Public } from '../../../../shared/auth/public.decorator.js';
import { InvalidCredentialsError } from './errors/invalid-credentials.error.js';
import { LoginRequestDto } from './dtos/login-request.dto.js';
import { SessionService } from './session.service.js';
import { TooManyLoginAttemptsError } from './errors/too-many-login-attempts.error.js';

/** The session as a resource: sign in (POST), sign out (DELETE), who is signed in (GET). */
@Controller('auth/session')
export class SessionController {
  constructor(
    private readonly sessions: SessionService,
    private readonly config: AppConfig,
  ) {}

  @Public()
  @Post()
  @ZodSerializerDto(sessionResponseSchema)
  async signIn(@Req() request: Request, @Body() body: LoginRequestDto): Promise<SessionResponse> {
    const user = await this.verify(body.username, body.password, request.ip ?? 'unknown');

    await regenerateSession(request);
    request.session.userId = user.id;
    if (body.keepSignedIn) {
      request.session.cookie.maxAge = this.config.sessionMaxLifetimeMs;
    }
    await this.sessions.startSession(user.id, request.sessionID);

    return { user };
  }

  /** The session guard answers 401 without a valid session. */
  @Get()
  @ZodSerializerDto(sessionResponseSchema)
  current(@CurrentUser() user: User): SessionResponse {
    return { user };
  }

  @Delete()
  @HttpCode(204)
  async signOut(
    @CurrentUser() user: User,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const sessionId = request.sessionID;
    await destroySession(request);
    await this.sessions.endSession(user.id, sessionId);
    response.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  private async verify(username: string, password: string, clientIp: string): Promise<User> {
    try {
      return await this.sessions.verify(username, password, clientIp);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
      if (error instanceof TooManyLoginAttemptsError) {
        throw new HttpException(
          { message: error.message, retryAfterSeconds: Math.ceil(error.retryAfterMs / 1000) },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw error;
    }
  }
}
