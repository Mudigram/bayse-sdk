import { BayseHttpClient } from './client';
import { EventsModule } from './modules/events';
import { BayseConfig } from './types';

// ============================================================
// Bayse SDK — Main Entry Point
//
// Usage:
//   import BayseClient from 'bayse-sdk'
//
//   const bayse = new BayseClient({
//     publicKey: process.env.BAYSE_PUBLIC_KEY!,
//     secretKey: process.env.BAYSE_SECRET_KEY!,
//   })
//
//   const { events } = await bayse.events.getAll({ status: 'open' })
// ============================================================

export class BayseClient {
    public events: EventsModule;

    // More modules get added here in Week 2:
    // public markets: MarketsModule
    // public orders: OrdersModule
    // public portfolio: PortfolioModule
    // public wallet: WalletModule
    // public stream: { markets(): ..., realtime(): ... }

    constructor(config: BayseConfig) {
        if (!config.publicKey) throw new Error('[bayse-sdk] publicKey is required');
        if (!config.secretKey) throw new Error('[bayse-sdk] secretKey is required');

        const http = new BayseHttpClient(config);

        this.events = new EventsModule(http);
    }
}

// Named exports for types — consumers can import these too
export * from './types';

// Default export
export default BayseClient;