import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from './config';
import { getAuthHeaders } from './auth';

export interface ApiResponse<T = any> {
  status: number;
  json: T | null;
  ok: boolean;
  statusText: string;
}

export class HttpClient {
  constructor(private request: APIRequestContext, private baseURL: string) {}

  private async handleResponse<T = any>(response: APIResponse, expectSuccess = true): Promise<ApiResponse<T>> {
    const status = response.status();
    const ok = response.ok();
    const statusText = response.statusText();
    let json: T | null = null;
    try {
      json = await response.json();
    } catch {}
    this.logRequest(response.url(), status, ok);
    if (expectSuccess && !ok) {
      throw new Error(`Request failed with status ${status}: ${statusText}\nURL: ${response.url()}\nResponse: ${JSON.stringify(json, null, 2)}`);
    }
    return { status, json, ok, statusText };
  }

  private logRequest(url: string, status: number, ok: boolean): void {
    const emoji = ok ? '✅' : '❌';
    console.log(`${emoji} [${status}] ${url}`);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const authHeaders = getAuthHeaders();
    Object.assign(headers, authHeaders);

    if (config.apiKey && !headers['api_key']) {
      headers['api_key'] = config.apiKey;
    }

    if (config.oauthToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${config.oauthToken}`;
    }

    return headers;
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>, expectSuccess = true): Promise<ApiResponse<T>> {
    const response = await this.request.get(`${this.baseURL}${endpoint}`, { headers: this.getHeaders(), params });
    return this.handleResponse<T>(response, expectSuccess);
  }

  async post<T = any>(endpoint: string, data?: any, expectSuccess = true): Promise<ApiResponse<T>> {
    const response = await this.request.post(`${this.baseURL}${endpoint}`, { headers: this.getHeaders(), data });
    return this.handleResponse<T>(response, expectSuccess);
  }

  async put<T = any>(endpoint: string, data?: any, expectSuccess = true): Promise<ApiResponse<T>> {
    const response = await this.request.put(`${this.baseURL}${endpoint}`, { headers: this.getHeaders(), data });
    return this.handleResponse<T>(response, expectSuccess);
  }

  async delete<T = any>(endpoint: string, expectSuccess = true): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`${this.baseURL}${endpoint}`, { headers: this.getHeaders() });
    return this.handleResponse<T>(response, expectSuccess);
  }
}

