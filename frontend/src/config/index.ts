export interface AppConfig {
  VITE_API_URL: string;
  DEV: boolean;
  MODE: string;
}

const VITE_API_URL = import.meta.env.VITE_API_URL;
const DEV = import.meta.env.DEV;
const MODE = import.meta.env.MODE;

const DEV_DEFAULT_API_URL = 'http://localhost:8063/api';

const isUsingDefault = !VITE_API_URL || VITE_API_URL.trim() === '';

if (DEV && isUsingDefault) {
  console.warn(
    '%c[Config] WARNING: VITE_API_URL is not set, using development default: ' + DEV_DEFAULT_API_URL,
    'color: orange; font-weight: bold;'
  );
}

if (!DEV && isUsingDefault) {
  console.error(
    '%c[Config] FATAL: VITE_API_URL is required in production build!',
    'color: red; font-weight: bold; font-size: 14px;'
  );
}

const config: AppConfig = {
  VITE_API_URL: isUsingDefault ? DEV_DEFAULT_API_URL : VITE_API_URL,
  DEV,
  MODE,
};

export const getApiBaseUrl = (): string => config.VITE_API_URL;

export const getApiRoot = (): string => {
  return config.VITE_API_URL.replace(/\/api$/, '');
};

export const isDevMode = (): boolean => config.DEV;

export default config;
