import { BayseHttpClient } from '../client';
import { PaginatedResponse, Activity, Portfolio } from '../types';

export class PortfolioModule {
    constructor(private client: BayseHttpClient) { }


    async getPositions(): Promise<Portfolio> {
        return this.client.get<Portfolio>('/v1/pm/portfolio');
    }


    async getActivities(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Activity>> {
        return this.client.get<PaginatedResponse<Activity>>(
            '/v1/pm/activities',
            params as Record<string, unknown>
        );
    }
}