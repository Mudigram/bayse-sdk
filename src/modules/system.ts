import { BayseHttpClient } from '../client';

export class SystemModule {
    constructor(private client: BayseHttpClient) { }

    async health(): Promise<{ status: string }> {
        return this.client.publicGet<{ status: string }>('/health');
    }

    async version(): Promise<{ version: string }> {
        return this.client.publicGet<{ version: string }>('/version');
    }
}