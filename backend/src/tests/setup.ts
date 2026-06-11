import prisma, { shutdownPrisma } from '../lib/prisma';

const TABLES_TO_CLEAN = [
  'Interaction',
  'Work',
  'Message',
  'OperationLog',
  'User',
  'StyleConfig',
  'SystemSetting',
] as const;

beforeAll(async () => {
  console.log('[Test Setup] Initializing test database connection...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[Test Setup] Database connection established');
  } catch (error) {
    console.error('[Test Setup] Failed to connect to database:', error);
    console.error('Please ensure MySQL is running and test database exists.');
    console.error('Run: CREATE DATABASE IF NOT EXISTS portfolio_test;');
    process.exit(1);
  }
});

beforeEach(async () => {
  for (const table of TABLES_TO_CLEAN) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1;`);
    } catch (error) {
      console.warn(`[Test Setup] Warning cleaning table ${table}:`, error);
    }
  }
});

afterAll(async () => {
  console.log('[Test Teardown] Cleaning up and closing database connection...');
  await shutdownPrisma();
  console.log('[Test Teardown] Done');
});
