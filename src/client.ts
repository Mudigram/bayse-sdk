import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { generateWriteAuthHeaders } from './auth';
import {
    BayseConfig,
    BayseApiError,
    BayseAuthError,
    BayseRateLimitError,
    BayseNotFoundError,
} from './types';

import { validateId } from './utils';
// ============================================================
// Bayse HTTP Client
//
// This is the core of the SDK. Every module (events, orders,
// portfolio etc.) uses this client to make requests.
//
// It handles:
//  - Attaching the right auth headers per request type
//  - Mapping HTTP errors to typed BayseError classes
//  - Auto-retry on 429 rate limit responses
// ============================================================

const DEFAULT_BASE_URL = 'https://relay.bayse.markets';

export class BayseHttpClient {
    private http: AxiosInstance;
    private publicKey: string;
    private secretKey: string;

    constructor(config: BayseConfig) {
        this.publicKey = config.publicKey;
        this.secretKey = config.secretKey;

        this.http = axios.create({
            baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // --- Public GET (no auth needed) ----------------------------

    async publicGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
        return this.request<T>({ method: 'GET', url: path, params });
    }

    // --- Authenticated GET (X-Public-Key only) ------------------

    async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
        return this.request<T>({
            method: 'GET',
            url: path,
            params,
            headers: {
                'X-Public-Key': this.publicKey,
            },
        });
    }

    // --- Authenticated POST (full HMAC signature) ---------------

    async post<T>(path: string, body?: object): Promise<T> {
        const bodyStr = body ? JSON.stringify(body) : null;
        const writeHeaders = generateWriteAuthHeaders(this.secretKey, 'POST', path, bodyStr);

        return this.request<T>({
            method: 'POST',
            url: path,
            data: bodyStr,
            headers: {
                'X-Public-Key': this.publicKey,
                ...writeHeaders,
            },
        });
    }

    // --- Authenticated DELETE (full HMAC signature) -------------

    async delete<T>(path: string): Promise<T> {
        const writeHeaders = generateWriteAuthHeaders(this.secretKey, 'DELETE', path, null);

        return this.request<T>({
            method: 'DELETE',
            url: path,
            headers: {
                'X-Public-Key': this.publicKey,
                ...writeHeaders,
            },
        });
    }

    // --- Core request method ------------------------------------

    private async request<T>(config: AxiosRequestConfig, retryCount = 0): Promise<T> {
        try {
            const response = await this.http.request<T>(config);
            return response.data;
        } catch (error: unknown) {
            if (!axios.isAxiosError(error)) throw error;

            const status = error.response?.status;
            const data = error.response?.data as { message?: string; error?: string; retryAfter?: number } | undefined;

            // 429 — Rate limited. Wait retryAfter seconds, then retry once.
            if (status === 429 && retryCount === 0) {
                const retryAfter = data?.retryAfter ?? 1;
                console.warn(`[bayse-markets-sdk] Rate limited. Retrying in ${retryAfter}s...`);
                await sleep(retryAfter * 1000);
                return this.request<T>(config, retryCount + 1);
            }

            // 401 — Bad API key or signature
            if (status === 401) {
                throw new BayseAuthError(data?.message ?? 'Invalid API key or signature');
            }

            // 404 — Resource not found
            if (status === 404) {
                throw new BayseNotFoundError(data?.message ?? 'Resource not found');
            }

            // 429 — Rate limited again after retry
            if (status === 429) {
                throw new BayseRateLimitError(data?.retryAfter ?? 60);
            }

            // Everything else
            throw new BayseApiError(
                status ?? 0,
                data?.error ?? 'unknown_error',
                data?.message ?? 'An unexpected error occurred'
            );
        }
    }
}
// Helper: pause execution for ms milliseconds
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}