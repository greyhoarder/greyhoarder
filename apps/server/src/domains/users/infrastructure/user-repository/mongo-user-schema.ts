import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type User, type UserRole, userRoles } from '@greyhoarder/domain/users';

/** Usernames compare without regard to case (ADR-0007: one account per name). */
export const CASE_INSENSITIVE = { locale: 'en', strength: 2 } as const;

/** Stored form of a `User`; Mongoose adds `id` as a string. */
@Schema({ collection: 'users', timestamps: true })
export class UserDbo implements Omit<User, 'id'> {
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true, enum: [...userRoles] })
  role: UserRole;

  @Prop({ type: Boolean, required: true, default: false })
  disabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserDbo);

UserSchema.index({ username: 1 }, { unique: true, collation: CASE_INSENSITIVE });
