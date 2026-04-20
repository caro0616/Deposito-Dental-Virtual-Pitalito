import { NotificationsModule } from './modules/notifications/notifications.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './modules/orders/orders.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';
import databaseConfig, { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // ── Variables de entorno ──────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
      validate: (config: Record<string, string>) => {
        if (!config['MONGODB_URI']) {
          throw new Error(
            'MONGODB_URI es requerido. Copia .env.example a .env y configura tu MongoDB Atlas.',
          );
        }
        return config;
      },
    }),

    // ── Conexión MongoDB Atlas ────────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const db = configService.get<DatabaseConfig>('database');
        return {
          uri: db?.uri ?? '',
          dbName: db?.dbName ?? 'deposito_dental',
          retryWrites: true,
          serverSelectionTimeoutMS: 5_000,
          socketTimeoutMS: 45_000,
          connectTimeoutMS: 10_000,
          maxPoolSize: 10,
          minPoolSize: 2,
          heartbeatFrequencyMS: 10_000,
        };
      },
      inject: [ConfigService],
    }),

    // ── Módulos de funcionalidades ────────────────────────────────────────
    AuthModule, // US-09: autenticación local + Google OAuth
    CatalogModule, // US-01 a US-06, US-22, US-23
    OrdersModule, // US-07, US-08, US-10, US-24
    NotificationsModule,
  ],
})
export class AppModule {}
