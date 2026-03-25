import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './modules/orders/orders.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import databaseConfig, { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // ── Environment variables ──────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
      // Validate that MONGODB_URI is present at startup
      validate: (config: Record<string, string>) => {
        if (!config['MONGODB_URI']) {
          throw new Error(
            'MONGODB_URI environment variable is required. ' +
              'Copy .env.example to .env and fill in your MongoDB Atlas connection string.',
          );
        }
        return config;
      },
    }),

    // ── MongoDB Atlas connection ───────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const db = configService.get<DatabaseConfig>('database');
        return {
          uri: db?.uri ?? '',
          dbName: db?.dbName ?? 'deposito_dental',
          // Connection pool & timeout settings
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

    // ── Feature modules ───────────────────────────────────────────────────
    OrdersModule,
    CatalogModule,
  ],
})
export class AppModule {}
