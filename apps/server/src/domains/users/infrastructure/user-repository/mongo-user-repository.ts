import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { User } from '@greyhoarder/domain/users';
import type { Model } from 'mongoose';
import type { UserQueries } from '../../ports/user-queries.js';
import type { UserCredentials } from '../../ports/user-credentials.js';
import { UserRepository } from '../../ports/user-repository.js';
import { CASE_INSENSITIVE, UserDbo } from './mongo-user-schema.js';

/** MongoDB adapter for both user ports: the internal repository and the read-only queries. */
@Injectable()
export class MongoUserRepository extends UserRepository implements UserQueries {
  constructor(@InjectModel(UserDbo.name) private readonly users: Model<UserDbo>) {
    super();
  }

  async findById(id: string): Promise<User | undefined> {
    return (await this.users.findById(id).exec()) ?? undefined;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return (await this.users.findOne({ username }).collation(CASE_INSENSITIVE).exec()) ?? undefined;
  }

  async findCredentials(username: string): Promise<UserCredentials | undefined> {
    const user = await this.users
      .findOne({ username })
      .collation(CASE_INSENSITIVE)
      .select('+passwordHash')
      .exec();
    return user ? { user, passwordHash: user.passwordHash } : undefined;
  }
}
