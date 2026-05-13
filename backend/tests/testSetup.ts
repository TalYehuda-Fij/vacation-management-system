import 'reflect-metadata';
import { beforeAll } from 'vitest';
import { AppDataSource } from '../src/config/data-source.js';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
  }
});
