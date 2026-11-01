import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Patch,
  Put,
  StreamableFile,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { User } from '@greyhoarder/domain/users';
import { type SessionResponse, sessionResponseSchema } from '@greyhoarder/protocol/auth';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { SetAvatarRequestDto } from './dtos/set-avatar-request.dto.js';
import { UpdateProfileRequestDto } from './dtos/update-profile-request.dto.js';
import { InvalidAvatarError } from './errors/invalid-avatar.error.js';
import { ProfileService } from './profile.service.js';

/** The signed-in user's profile (`me`), and the pictures of all users for those signed in. */
@Controller('users')
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Patch('me')
  @ZodSerializerDto(sessionResponseSchema)
  async update(@CurrentUser() user: User, @Body() body: UpdateProfileRequestDto): Promise<SessionResponse> {
    return { user: await this.profiles.update(user.id, body) };
  }

  @Put('me/avatar')
  @ZodSerializerDto(sessionResponseSchema)
  async setAvatar(@CurrentUser() user: User, @Body() body: SetAvatarRequestDto): Promise<SessionResponse> {
    try {
      return { user: await this.profiles.setAvatar(user, Buffer.from(body.image, 'base64')) };
    } catch (error) {
      if (error instanceof InvalidAvatarError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }

  @Delete('me/avatar')
  @ZodSerializerDto(sessionResponseSchema)
  async removeAvatar(@CurrentUser() user: User): Promise<SessionResponse> {
    return { user: await this.profiles.removeAvatar(user) };
  }

  /** The address carries the picture's id, so a new picture is a new address and this one can be kept. */
  @Get(':id/avatar')
  @Header('Cache-Control', 'private, max-age=31536000, immutable')
  @Header('X-Content-Type-Options', 'nosniff')
  async avatar(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.profiles.avatarOf(id);
    if (image === undefined) {
      throw new NotFoundException();
    }
    return new StreamableFile(image, { type: 'image/jpeg' });
  }
}
