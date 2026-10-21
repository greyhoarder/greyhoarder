import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUserRepository } from './infrastructure/user-repository/mongo-user-repository.js';
import { UserDbo, UserSchema } from './infrastructure/user-repository/mongo-user-schema.js';
import { UserRepository } from './ports/user-repository.js';

/** Accounts and roles (ADR-0007). Depends on no other domain. */
@Module({
  imports: [MongooseModule.forFeature([{ name: UserDbo.name, schema: UserSchema }])],
  providers: [{ provide: UserRepository, useClass: MongoUserRepository }],
})
export class UsersModule {}
