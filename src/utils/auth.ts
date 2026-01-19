import * as dotenv from 'dotenv';

dotenv.config();

export interface AuthConfig {
  apiKey?: string;
  oauthToken?: string;
}

export class AuthManager {
  private static apiKey: string | undefined = process.env.PETSTORE_API_KEY || process.env.API_KEY;
  private static oauthToken: string | undefined = process.env.PETSTORE_OAUTH_TOKEN;

  static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['api_key'] = this.apiKey;
    }

    if (this.oauthToken) {
      headers['Authorization'] = `Bearer ${this.oauthToken}`;
    }

    return headers;
  }

  static hasApiKey(): boolean {
    return !!this.apiKey;
  }

  static hasOAuthToken(): boolean {
    return !!this.oauthToken;
  }

  static hasAnyAuth(): boolean {
    return this.hasApiKey() || this.hasOAuthToken();
  }

  static setApiKey(apiKey: string | undefined): void {
    this.apiKey = apiKey;
  }

  static setOAuthToken(token: string | undefined): void {
    this.oauthToken = token;
  }

  static clearAuth(): void {
    this.apiKey = undefined;
    this.oauthToken = undefined;
  }

  static getApiKey(): string | undefined {
    return this.apiKey;
  }

  static getOAuthToken(): string | undefined {
    return this.oauthToken;
  }

  static createTestHeaders(options: { 
    includeApiKey?: boolean; 
    includeOAuth?: boolean;
    customApiKey?: string;
    customOAuthToken?: string;
  } = {}): Record<string, string> {
    const headers: Record<string, string> = {};

    if (options.includeApiKey) {
      headers['api_key'] = options.customApiKey || this.apiKey || 'test-api-key';
    }

    if (options.includeOAuth) {
      headers['Authorization'] = `Bearer ${options.customOAuthToken || this.oauthToken || 'test-oauth-token'}`;
    }

    return headers;
  }
}

export function getAuthHeaders(): Record<string, string> {
  return AuthManager.getAuthHeaders();
}
