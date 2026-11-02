import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { type AccountsResponse, accountsResponseSchema } from '@greyhoarder/protocol/auth';
import { ZodSerializerDto } from 'nestjs-zod';
import { Roles } from '../../../../shared/auth/roles.decorator.js';
import { UnknownAccountError, UsernameTakenError } from '../../../users/api/index.js';
import { AccountsManagementService } from './accounts-management.service.js';
import { AddAccountRequestDto } from './dtos/add-account-request.dto.js';
import { SetPasswordRequestDto } from './dtos/set-password-request.dto.js';

/** The accounts of the instance: listing them (GET) and adding one (POST). */
@Controller('auth/accounts')
@Roles('admin')
export class AccountsController {
  constructor(private readonly accounts: AccountsManagementService) {}

  @Get()
  @ZodSerializerDto(accountsResponseSchema)
  async list(): Promise<AccountsResponse> {
    return { users: await this.accounts.list() };
  }

  /** 201 without a body. */
  @Post()
  async add(@Body() body: AddAccountRequestDto): Promise<void> {
    try {
      await this.accounts.add(body.username, body.role, body.password);
    } catch (error) {
      if (error instanceof UsernameTakenError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  /** A forgotten password; the account's sessions end with it. */
  @Put(':id/password')
  @HttpCode(204)
  async setPassword(@Param('id') id: string, @Body() body: SetPasswordRequestDto): Promise<void> {
    try {
      await this.accounts.setPassword(id, body.password);
    } catch (error) {
      if (error instanceof UnknownAccountError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
