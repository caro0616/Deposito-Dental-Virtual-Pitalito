export type UserRole = 'customer' | 'admin';

/**
 * Authentication provider.
 * - 'local'  → email + password (bcrypt)
 * - 'google' → OAuth 2.0 via Google (passport-google-oauth20, future)
 */
export type UserProvider = 'local' | 'google';

export interface UserAddress {
  street: string;
  city: string;
  department: string;
  postalCode: string;
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public name: string,
    public provider: UserProvider = 'local',
    public googleId: string | null = null,
    public phone: string = '',
    public address: UserAddress | null = null,
    public active: boolean = true,
  ) {}

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isGoogleUser(): boolean {
    return this.provider === 'google';
  }
}
