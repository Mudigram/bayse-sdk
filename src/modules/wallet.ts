import { BayseHttpClient } from '../client';
import { WalletAsset } from '../types';



export class WalletsModule {
    constructor(private client: BayseHttpClient) { }

    async getAssets(): Promise<{ assets: WalletAsset[] }> {
        return this.client.get<{ assets: WalletAsset[] }>('/v1/wallet/assets');
    }
}