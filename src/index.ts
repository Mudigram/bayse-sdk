import { BayseHttpClient } from './client';
import { EventsModule } from './modules/events';
import { MarketsModule } from './modules/markets';
import { OrdersModule } from './modules/orders';
import { PortfolioModule } from './modules/portfolio';
import { WalletsModule } from './modules/wallet';
import { SystemModule } from './modules/system';
import { MarketsStream } from './websocket/markets';
import { RealtimeStream } from './websocket/realtime';
import { BayseConfig } from './types';

// ============================================================
// Bayse SDK — Main Entry Point
//
// Usage:
//   import BayseClient from 'bayse-markets-sdk'
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
    public markets: MarketsModule;
    public orders: OrdersModule;
    public portfolio: PortfolioModule;
    public wallet: WalletsModule;
    public system: SystemModule;
    public stream = {
        markets: () => new MarketsStream(),
        realtime: () => new RealtimeStream(),
    };

    // More modules get added here in Week 2:
    // public markets: MarketsModule
    // public orders: OrdersModule
    // public portfolio: PortfolioModule
    // public wallet: WalletModule
    // public stream: { markets(): ..., realtime(): ... }

    constructor(config: BayseConfig) {
        if (!config.publicKey) throw new Error('[bayse-markets-sdk] publicKey is required');
        if (!config.secretKey) throw new Error('[bayse-markets-sdk] secretKey is required');

        const http = new BayseHttpClient(config);

        this.events = new EventsModule(http);
        this.markets = new MarketsModule(http);
        this.orders = new OrdersModule(http);
        this.portfolio = new PortfolioModule(http);
        this.wallet = new WalletsModule(http);
        this.system = new SystemModule(http);
    }
}

// Named exports for types — consumers can import these too
export * from './types';

// Default export
export default BayseClient;