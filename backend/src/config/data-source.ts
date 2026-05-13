import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
import { VacationRequest } from '../entities/VacationRequest.js';
import { InitSchema1715000000000 } from '../migrations/1715000000000-InitSchema.js';

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: isTest
    ? (process.env.POSTGRES_TEST_DB ?? 'vacation_test')
    : (process.env.POSTGRES_DB ?? 'vacation'),
  entities: [User, VacationRequest],
  migrations: [InitSchema1715000000000],
  synchronize: false,
  logging: false,
});
