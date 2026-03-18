import { registerAs } from '@nestjs/config';
import { DataSource } from 'typeorm';

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'crm_user',
  password: process.env.DATABASE_PASSWORD || 'crm_password_2025',
  database: process.env.DATABASE_NAME || 'crm_db',
}));

// 用于 TypeORM CLI 的 DataSource
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'crm_user',
  password: process.env.DATABASE_PASSWORD || 'crm_password_2025',
  database: process.env.DATABASE_NAME || 'crm_db',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
});
