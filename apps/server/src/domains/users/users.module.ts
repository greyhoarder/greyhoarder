import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsService } from './features/accounts/accounts.service.js';
import {
  InitialAdminMarkerDbo,
  InitialAdminMarkerSchema,
} from './infrastructure/user-repository/schemas/mongo-initial-admin-marker-schema.js';
import { MongoUserRepository } from './infrastructure/user-repository/mongo-user-repository.js';
import { UserDbo, UserSchema } from './infrastructure/user-repository/schemas/mongo-user-schema.js';
import { UserQueries } from './ports/user-queries.js';
import { UserRepository } from './ports/user-repository.js';

/** Accounts, roles and their storage (ADR-0007). Depends on no other domain. */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDbo.name, schema: UserSchema },
      { name: InitialAdminMarkerDbo.name, schema: InitialAdminMarkerSchema },
    ]),
  ],
  providers: [
    AccountsService,
    MongoUserRepository,
    { provide: UserRepository, useExisting: MongoUserRepository },
    { provide: UserQueries, useExisting: MongoUserRepository },
  ],
  exports: [UserQueries, AccountsService],
})
export class UsersModule {}
