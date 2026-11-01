import { Body, ConflictException, Controller, Delete, HttpCode, NotFoundException, Param, Patch } from '@nestjs/common';
import { type AccountResponse, accountResponseSchema } from '@greyhoarder/protocol/auth';
import { ZodSerializerDto } from 'nestjs-zod';
import { Roles } from '../../../../shared/auth/roles.decorator.js';
import { UpdateAccountRequestDto } from './dtos/update-account-request.dto.js';
import { LastAdministratorError } from './errors/last-administrator.error.js';
import { UnknownAccountError } from './errors/unknown-account.error.js';
import { UserManagementService } from './user-management.service.js';

/** The accounts of the instance as administrators change them. */
@Controller('users/accounts')
@Roles('admin')
export class UserManagementController {
  constructor(private readonly management: UserManagementService) {}

  @Patch(':id')
  @ZodSerializerDto(accountResponseSchema)
  update(@Param('id') id: string, @Body() body: UpdateAccountRequestDto): Promise<AccountResponse> {
    return httpErrors(() => this.management.change(id, body));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return httpErrors(() => this.management.remove(id));
  }
}

async function httpErrors<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof UnknownAccountError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof LastAdministratorError) {
      throw new ConflictException(error.message);
    }
    throw error;
  }
}
