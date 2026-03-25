import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole, UserProvider } from '../../../domain/user.entity';

// ─── Address subdocument ──────────────────────────────────────────────────────

@Schema({ _id: false, versionKey: false })
export class AddressSubdoc {
  @Prop({ required: true })
  street!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  department!: string;

  @Prop({ default: '' })
  postalCode!: string;
}

export const AddressSubdocSchema = SchemaFactory.createForClass(AddressSubdoc);

// ─── User document ────────────────────────────────────────────────────────────

export type UserDocument = UserDoc & Document;

const USER_ROLES: UserRole[] = ['customer', 'admin'];
const USER_PROVIDERS: UserProvider[] = ['local', 'google'];

@Schema({
  collection: 'users',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class UserDoc {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  email!: string;

  /**
   * bcrypt hash of the password.
   * Required only for 'local' provider; may be empty for OAuth users.
   */
  @Prop({ default: '' })
  passwordHash!: string;

  @Prop({
    required: true,
    type: String,
    enum: USER_ROLES,
    default: 'customer' satisfies UserRole,
  })
  role!: UserRole;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ type: AddressSubdocSchema, default: null })
  address!: AddressSubdoc | null;

  /**
   * Authentication provider.
   * 'local'  → email + password
   * 'google' → OAuth 2.0 via Google (passport-google-oauth20)
   */
  @Prop({
    required: true,
    type: String,
    enum: USER_PROVIDERS,
    default: 'local' satisfies UserProvider,
  })
  provider!: UserProvider;

  /**
   * Google OAuth subject identifier.
   * Populated only when provider === 'google'.
   */
  @Prop({ type: String, default: null })
  googleId!: string | null;

  @Prop({ required: true, default: true })
  active!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDoc);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ provider: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 });
