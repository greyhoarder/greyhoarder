import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import { type SetupStatusResponse, setupStatusResponseSchema } from '@greyhoarder/protocol/auth';
import { ZodSerializerDto } from 'nestjs-zod';
import { Public } from '../../../../shared/auth/public.decorator.js';
import { AccountsAlreadyExistError } from '../../../users/api/index.js';
import { SetupRequestDto } from './dtos/setup-request.dto.js';
import { SetupService } from './setup.service.js';

/** The initial setup: whether it is still needed (GET) and creating the first administrator (POST). */
@Controller('auth/setup')
export class SetupController {
  constructor(private readonly setup: SetupService) {}

  @Public()
  @Get()
  @ZodSerializerDto(setupStatusResponseSchema)
  async status(): Promise<SetupStatusResponse> {
    return { required: await this.setup.isRequired() };
  }

  /** 201 without a body; signing in is a separate step through `auth/session`. */
  @Public()
  @Post()
  async createAdministrator(@Body() body: SetupRequestDto): Promise<void> {
    try {
      await this.setup.createAdministrator(body.username, body.password);
    } catch (error) {
      if (error instanceof AccountsAlreadyExistError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
