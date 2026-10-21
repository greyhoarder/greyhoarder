import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { User } from '@greyhoarder/domain/users';
import type { Model, Types } from 'mongoose';
import type { UserQueries } from '../../ports/user-queries.js';
import type { UserCredentials } from '../../ports/user-credentials.js';
import { UserRepository } from '../../ports/user-repository.js';
import { CASE_INSENSITIVE, UserDbo } from './mongo-user-schema.js';

type StoredUser = Pick<UserDbo, 'username' | 'role' | 'disabled'> & { _id: Types.ObjectId };

/** Copies only the fields of `User`, so the hash, `__v` and timestamps never leave this adapter. */
function toUser(stored: StoredUser): User {
  return {
    id: stored._id.toHexString(),
    username: stored.username,
    role: stored.role,
    disabled: stored.disabled,
  };
}

/** MongoDB adapter for both user ports: the internal repository and the read-only queries. */
@Injectable()
export class MongoUserRepository extends UserRepository implements UserQueries {
  constructor(@InjectModel(UserDbo.name) private readonly users: Model<UserDbo>) {
    super();
  }

  async findById(id: string): Promise<User | undefined> {
    const stored = await this.users.findById(id).lean().exec();
    return stored ? toUser(stored) : undefined;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const stored = await this.users.findOne({ username }).collation(CASE_INSENSITIVE).lean().exec();
    return stored ? toUser(stored) : undefined;
  }

  async findCredentials(username: string): Promise<UserCredentials | undefined> {
    const stored = await this.users
      .findOne({ username })
      .collation(CASE_INSENSITIVE)
      .select('+passwordHash')
      .lean()
      .exec();
    return stored ? { user: toUser(stored), passwordHash: stored.passwordHash } : undefined;
  }
}
