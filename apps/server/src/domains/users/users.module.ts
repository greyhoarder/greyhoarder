import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsService } from './features/accounts/accounts.service.js';
import { UserManagementController } from './features/management/user-management.controller.js';
import { UserManagementService } from './features/management/user-management.service.js';
import { ProfileController } from './features/profile/profile.controller.js';
import { ProfileService } from './features/profile/profile.service.js';
import { FileAvatarFiles } from './infrastructure/file-avatar-files.js';
import {
  InitialAdminMarkerDbo,
  InitialAdminMarkerSchema,
} from './infrastructure/user-repository/schemas/mongo-initial-admin-marker-schema.js';
import { MongoUserRepository } from './infrastructure/user-repository/mongo-user-repository.js';
import { UserDbo, UserSchema } from './infrastructure/user-repository/schemas/mongo-user-schema.js';
import { AvatarFiles } from './ports/avatar-files.js';
import { UserQueries } from './ports/user-queries.js';
import { UserRepository } from './ports/user-repository.js';

/** Accounts, roles, profiles and their storage (ADR-0007). Depends on no other domain. */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDbo.name, schema: UserSchema },
      { name: InitialAdminMarkerDbo.name, schema: InitialAdminMarkerSchema },
    ]),
  ],
  controllers: [ProfileController, UserManagementController],
  providers: [
    AccountsService,
    ProfileService,
    UserManagementService,
    { provide: AvatarFiles, useClass: FileAvatarFiles },
    MongoUserRepository,
    { provide: UserRepository, useExisting: MongoUserRepository },
    { provide: UserQueries, useExisting: MongoUserRepository },
  ],
  exports: [UserQueries, AccountsService],
})
export class UsersModule {}
