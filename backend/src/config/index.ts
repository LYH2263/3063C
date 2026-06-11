import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

const DEV_DEFAULTS: Record<string, string> = {
  PORT: '8063',
  JWT_SECRET: 'supersecretjwtkey_12345',
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().refine(
    (val) => val >= 1 && val <= 65535,
    { message: 'PORT must be between 1 and 65535' }
  ),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL cannot be empty'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

export const loadConfig = (): EnvConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const raw = { ...process.env };

  const missingInProduction: string[] = [];
  const usingDefaults: string[] = [];

  for (const key of Object.keys(DEV_DEFAULTS)) {
    if (!raw[key] || raw[key]!.trim() === '') {
      if (isDev) {
        raw[key] = DEV_DEFAULTS[key];
        usingDefaults.push(key);
      } else {
        missingInProduction.push(key);
      }
    }
  }

  if (!isDev && missingInProduction.length > 0) {
    console.error('\n');
    console.error('========================================');
    console.error('  FATAL: Missing required environment variables');
    console.error('========================================');
    console.error(`  Environment: ${process.env.NODE_ENV || 'production'}`);
    console.error('  Missing variables:');
    for (const key of missingInProduction) {
      console.error(`    - ${key}`);
    }
    console.error('========================================');
    console.error('\n');
    process.exit(1);
  }

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues;
    console.error('\n');
    console.error('========================================');
    console.error('  FATAL: Environment variable validation failed');
    console.error('========================================');
    console.error(`  Environment: ${raw.NODE_ENV || 'development'}`);
    console.error('  Validation errors:');
    for (const issue of issues) {
      const path = issue.path.join('.') || '<root>';
      console.error(`    - ${path}: ${issue.message}`);
    }
    console.error('========================================');
    console.error('\n');
    process.exit(1);
  }

  cachedConfig = result.data;

  if (isDev && usingDefaults.length > 0) {
    console.warn('\n');
    console.warn('========================================');
    console.warn('  WARNING: Using default values for environment variables');
    console.warn('  This is OK for development but NOT for production.');
    console.warn('========================================');
    console.warn('  Variables with defaults:');
    for (const key of usingDefaults) {
      console.warn(`    - ${key}`);
    }
    console.warn('========================================');
    console.warn('\n');
  }

  return cachedConfig;
};

export const config: EnvConfig = loadConfig();

export const isProduction = (): boolean => config.NODE_ENV === 'production';
export const isDevelopment = (): boolean => config.NODE_ENV === 'development';
export const isTest = (): boolean => config.NODE_ENV === 'test';

export default config;
