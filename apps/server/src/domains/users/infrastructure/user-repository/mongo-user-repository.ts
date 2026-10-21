import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { User } from '@greyhoarder/domain/users';
import { type ClientSession, type Connection, type Model, mongo, type Types } from 'mongoose';
import type { UserQueries } from '../../ports/user-queries.js';
import type { UserCredentials } from '../../ports/user-credentials.js';
import { UserRepository } from '../../ports/user-repository.js';
import { AccountsAlreadyExistError } from '../../util/accounts-already-exist.error.js';
import { INITIAL_ADMIN_MARKER_ID, InitialAdminMarkerDbo } from './mongo-initial-admin-marker-schema.js';
import { CASE_INSENSITIVE, UserDbo } from './mongo-user-schema.js';

const DUPLICATE_KEY = 11000;

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
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(UserDbo.name) private readonly users: Model<UserDbo>,
    @InjectModel(InitialAdminMarkerDbo.name) private readonly markers: Model<InitialAdminMarkerDbo>,
  ) {
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

  async hasAny(): Promise<boolean> {
    return (await this.users.exists({}).exec()) !== null;
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

  async createInitialAdmin(username: string, passwordHash: string): Promise<void> {
    try {
      await this.connection.transaction((session) => this.insertInitialAdmin(session, username, passwordHash));
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === DUPLICATE_KEY) {
        throw new AccountsAlreadyExistError();
      }
      throw error;
    }
  }

  /** A concurrent setup conflicts on the marker; on retry it then sees the account created here. */
  private async insertInitialAdmin(session: ClientSession, username: string, passwordHash: string): Promise<void> {
    if (await this.users.exists({}).session(session).exec()) {
      throw new AccountsAlreadyExistError();
    }
    await this.markers.create([{ _id: INITIAL_ADMIN_MARKER_ID }], { session });
    await this.users.create([{ username, passwordHash, role: 'admin', disabled: false }], { session });
  }
}
