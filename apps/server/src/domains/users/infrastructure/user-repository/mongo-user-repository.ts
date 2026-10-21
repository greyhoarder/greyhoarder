import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { User } from '@greyhoarder/domain/users';
import type { Model } from 'mongoose';
import { UserRepository } from '../../ports/user-repository.js';
import { CASE_INSENSITIVE, UserDbo } from './mongo-user-schema.js';

@Injectable()
export class MongoUserRepository extends UserRepository {
  constructor(@InjectModel(UserDbo.name) private readonly users: Model<UserDbo>) {
    super();
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return (await this.users.findOne({ username }).collation(CASE_INSENSITIVE).exec()) ?? undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return (await this.users.findById(id).exec()) ?? undefined;
  }
}
