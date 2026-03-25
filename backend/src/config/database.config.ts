import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    uri: process.env.MONGODB_URI ?? '',
    dbName: process.env.MONGODB_DB_NAME ?? 'deposito_dental',
  }),
);
