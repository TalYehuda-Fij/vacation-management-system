import 'reflect-metadata';
import { AppDataSource } from './config/data-source.js';

await AppDataSource.initialize();
await AppDataSource.runMigrations();
await AppDataSource.destroy();
