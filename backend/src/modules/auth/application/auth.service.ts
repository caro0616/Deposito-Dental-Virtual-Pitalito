import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomBytes, createHmac } from 'crypto';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { UserDoc, UserDocument } from '../infrastructure/persistence/schemas/user.schema';
import { RegisterDto } from '../presentation/dto/register.dto';
import { LoginDto } from '../presentation/dto/login.dto';
import { JwtPayload } from '../domain/token.entity';

/**
 * Servicio de autenticación.
 *
 * Hash de contraseña: PBKDF2-SHA256 con salt aleatorio de 16 bytes.
 * JWT: firmado con HMAC-SHA256 (HS256) — implementación propia sin dependencias externas.
 *
 * US-09: soporte para login local + estructura para Google OAuth.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtExpSeconds: number;
  private readonly googleClientId: string;
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectModel(UserDoc.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    this.jwtSecret = process.env['JWT_SECRET'] ?? 'changeme-secret-at-least-32-chars';
    const expRaw = process.env['JWT_EXPIRATION'] ?? '7d';
    this.jwtExpSeconds = this.parseExpiration(expRaw);
    this.googleClientId = process.env['GOOGLE_CLIENT_ID'] ?? '';
    this.googleClient = new OAuth2Client(this.googleClientId || undefined);
  }

  // ─── Registro ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ token: string }> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() }).lean().exec();

    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = this.hashPassword(dto.password);

    const created = await this.userModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      role: 'customer',
      provider: 'local',
    });

    const userId = (created._id as Types.ObjectId).toHexString();
    const token = this.signJwt({
      sub: userId,
      email: dto.email,
      role: 'customer',
      provider: 'local',
    });

    this.logger.log(`Nuevo usuario registrado: ${dto.email}`);
    return { token };
  }

  // ─── Login local ──────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .lean<UserDoc & { _id: Types.ObjectId }>()
      .exec();

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.active) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const valid = this.verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const userId = user._id.toHexString();
    const token = this.signJwt({
      sub: userId,
      email: user.email,
      role: user.role,
      provider: 'local',
    });

    return { token };
  }

  // ─── Login / registro con Google OAuth (US-09) ────────────────────────────

  /**
   * Se invoca tras validar el token de Google externamente.
   * Crea el usuario si no existe (upsert) y devuelve el JWT propio.
   */
  async loginWithGoogle(credential: string): Promise<{ token: string }> {
    const googleProfile = await this.verifyGoogleCredential(credential);

    let user = await this.userModel
      .findOne({ googleId: googleProfile.googleId })
      .lean<UserDoc & { _id: Types.ObjectId }>()
      .exec();

    if (!user) {
      const existingByEmail = await this.userModel
        .findOne({ email: googleProfile.email.toLowerCase() })
        .lean<UserDoc & { _id: Types.ObjectId }>()
        .exec();

      if (existingByEmail) {
        if (!existingByEmail.active) {
          throw new UnauthorizedException('Cuenta desactivada');
        }

        user = await this.userModel
          .findByIdAndUpdate(
            existingByEmail._id,
            {
              $set: {
                googleId: googleProfile.googleId,
                name: googleProfile.name,
              },
            },
            { returnDocument: 'after' },
          )
          .lean<UserDoc & { _id: Types.ObjectId }>()
          .exec();
      } else {
        user = await this.userModel
          .findOneAndUpdate(
            { googleId: googleProfile.googleId },
            {
              $set: {
                email: googleProfile.email.toLowerCase(),
                name: googleProfile.name,
                role: 'customer',
                provider: 'google',
                googleId: googleProfile.googleId,
                passwordHash: '',
                active: true,
              },
            },
            { upsert: true, returnDocument: 'after' },
          )
          .lean<UserDoc & { _id: Types.ObjectId }>()
          .exec();
      }
    }

    if (!user) {
      throw new NotFoundException('No se pudo crear el usuario de Google');
    }

    if (!user.active) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const userId = user._id.toHexString();
    const token = this.signJwt({
      sub: userId,
      email: user.email,
      role: user.role,
      provider: 'google',
    });

    return { token };
  }

  // ─── Validación de token ──────────────────────────────────────────────────

  verifyToken(token: string): JwtPayload {
    const [headerB64, payloadB64, sig] = token.split('.');
    if (!headerB64 || !payloadB64 || !sig) {
      throw new UnauthorizedException('Token inválido');
    }

    const expected = this.hmacSign(`${headerB64}.${payloadB64}`);
    if (!this.safeEqual(sig, expected)) {
      throw new UnauthorizedException('Firma del token inválida');
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    ) as JwtPayload & { exp: number };

    if (Date.now() / 1000 > payload.exp) {
      throw new UnauthorizedException('Token expirado');
    }

    return payload;
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  private signJwt(payload: JwtPayload): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.jwtExpSeconds,
      }),
    ).toString('base64url');
    const sig = this.hmacSign(`${header}.${body}`);
    return `${header}.${body}.${sig}`;
  }

  private hmacSign(data: string): string {
    return createHmac('sha256', this.jwtSecret).update(data).digest('base64url');
  }

  /** Comparación de strings en tiempo constante para prevenir timing attacks */
  private safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(salt + password)
      .digest('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const candidate = createHash('sha256')
      .update(salt + password)
      .digest('hex');
    return this.safeEqual(candidate, hash);
  }

  private parseExpiration(exp: string): number {
    const match = /^(\d+)([smhd])$/.exec(exp);
    if (!match || !match[1] || !match[2]) return 7 * 24 * 3600;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (units[unit] ?? 1);
  }

  private async verifyGoogleCredential(credential: string): Promise<{
    googleId: string;
    email: string;
    name: string;
  }> {
    if (!this.googleClientId) {
      throw new InternalServerErrorException('GOOGLE_CLIENT_ID no está configurado en el backend.');
    }

    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Token de Google inválido');
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('El token de Google no contiene datos válidos');
    }

    if (payload.email_verified === false) {
      throw new UnauthorizedException('La cuenta de Google no tiene el correo verificado');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name?.trim() || payload.email.split('@')[0] || 'Usuario Google',
    };
  }
}
