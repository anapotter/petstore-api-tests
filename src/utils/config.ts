import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL || 'https://petstore.swagger.io/v2',
  apiKey: process.env.API_KEY || process.env.PETSTORE_API_KEY || '',
  oauthToken: process.env.PETSTORE_OAUTH_TOKEN || '',
  env: process.env.ENV || 'dev',
  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  retries: parseInt(process.env.RETRIES || '2', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};
