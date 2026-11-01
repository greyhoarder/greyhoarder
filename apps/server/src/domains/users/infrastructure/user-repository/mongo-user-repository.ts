import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { User, UserRole } from '@greyhoarder/domain/users';
import { type ClientSession, type Connection, isValidObjectId, type Model, mongo, type Types } from 'mongoose';
import type { UserQueries } from '../../ports/user-queries.js';
import type { UserCredentials } from '../../models/user-credentials.js';
import { type ProfileChanges, UserRepository } from '../../ports/user-repository.js';
import { AccountsAlreadyExistError } from '../../util/accounts-already-exist.error.js';
import { UsernameTakenError } from '../../util/username-taken.error.js';
import { INITIAL_ADMIN_MARKER_ID, InitialAdminMarkerDbo } from './schemas/mongo-initial-admin-marker-schema.js';
import { CASE_INSENSITIVE, UserDbo } from './schemas/mongo-user-schema.js';

const DUPLICATE_KEY = 11000;

type StoredUser = Pick<
  UserDbo,
  'username' | 'role' | 'disabled' | 'displayName' | 'language' | 'avatarId' | 'createdAt' | 'lastLoginAt'
> & {
  _id: Types.ObjectId;
};

/** Copies only the fields of `User`, so the hash, `__v` and timestamps never leave this adapter. */
function toUser(stored: StoredUser): User {
  return {
    id: stored._id.toHexString(),
    username: stored.username,
    role: stored.role,
    disabled: stored.disabled,
    ...(stored.displayName === undefined ? {} : { displayName: stored.displayName }),
    ...(stored.language === undefined ? {} : { language: stored.language }),
    ...(stored.avatarId === undefined ? {} : { avatarId: stored.avatarId }),
    ...(stored.createdAt === undefined ? {} : { createdAt: stored.createdAt.toISOString() }),
    ...(stored.lastLoginAt === undefined ? {} : { lastLoginAt: stored.lastLoginAt.toISOString() }),
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
    if (!isValidObjectId(id)) {
      return undefined;
    }
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

  async findAll(): Promise<User[]> {
    const stored = await this.users.find().collation(CASE_INSENSITIVE).sort({ username: 1 }).lean().exec();
    return stored.map(toUser);
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

  async create(username: string, role: UserRole, passwordHash: string): Promise<void> {
    try {
      await this.users.create({ username, passwordHash, role, disabled: false });
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === DUPLICATE_KEY) {
        throw new UsernameTakenError();
      }
      throw error;
    }
  }

  async changePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.users.updateOne({ _id: id }, { $set: { passwordHash } }).exec();
  }

  async updateProfile(id: string, changes: ProfileChanges): Promise<User> {
    const entries = Object.entries(changes);
    const set = Object.fromEntries(entries.filter(([, value]) => value !== undefined));
    const unset = Object.fromEntries(entries.filter(([, value]) => value === undefined).map(([key]) => [key, '']));
    const stored = await this.users
      .findByIdAndUpdate(id, { $set: set, $unset: unset }, { returnDocument: 'after' })
      .lean()
      .orFail()
      .exec();
    return toUser(stored);
  }

  async updateAccount(id: string, changes: Partial<Pick<User, 'role' | 'disabled'>>): Promise<User> {
    const stored = await this.users
      .findByIdAndUpdate(id, { $set: changes }, { returnDocument: 'after' })
      .lean()
      .orFail()
      .exec();
    return toUser(stored);
  }

  async recordLogin(id: string, at: Date): Promise<void> {
    await this.users.updateOne({ _id: id }, { $set: { lastLoginAt: at } }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.users.deleteOne({ _id: id }).exec();
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
