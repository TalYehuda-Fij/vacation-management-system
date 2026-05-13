import 'reflect-metadata';
import { beforeAll, afterAll } from 'vitest';
import { AppDataSource } from '../src/config/data-source.js';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});
