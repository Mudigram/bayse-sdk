import { BayseHttpClient } from '../client';
import {
    Ticker,
    OrderBook,
    Trade,
    QuoteBody,
    QuoteResponse,
    ListTradesParams,
    GetOrderBookParams,
    Pagination,
    Currency,
} from '../types';

// ============================================================
// Markets Module
//
// Covers all /v1/pm/markets endpoints.
// Markets are the top-level container — each market has two outcomes (YES/NO).
// ============================================================

export class MarketsModule {
    constructor(private client: BayseHttpClient) { }

    /**
     * Get ticker for a market
     *
     * @example
     * const ticker = await bayse.markets.getTicker('a1b2c3d4-...')
     */
    async getTicker(marketId: string): Promise<Ticker> {
        return this.client.get<Ticker>(`/v1/pm/markets/${marketId}/ticker`);
    }

    /**
     * Get order book for a market
     *
     * @example
     * const orderBook = await bayse.markets.getOrderBook(['outcome-id-1', 'outcome-id-2'], 'USD');
     */
    async getOrderBook(outcomeIds: string[], currency?: Currency): Promise<OrderBook[]> {
        if (outcomeIds.length === 0) {
            throw new Error('[bayse-sdk] getOrderBook requires at least one outcomeId');
        }
        if (outcomeIds.length > 10) {
            throw new Error('[bayse-sdk] getOrderBook accepts a maximum of 10 outcomeIds');
        }

        // Build query string manually because axios doesn't repeat keys by default
        // Bayse needs: ?outcomeIds=abc&outcomeIds=def  (not ?outcomeIds=abc,def)
        const params = new URLSearchParams();
        outcomeIds.forEach((id) => params.append('outcomeIds', id));
        if (currency) params.append('currency', currency);

        return this.client.get<OrderBook[]>(`/v1/pm/books?${params.toString()}`);
    }

    /**
     * Get trades for a market
     *
     * @example
     * const trades = await bayse.markets.getTrades({ marketId: 'a1b2c3d4-...' })
     */
    async getTrades(params?: ListTradesParams): Promise<Trade[]> {
        return this.client.get(`/v1/pm/trades`, params as Record<string, unknown>);
    }

    /**
     * Get quote for a market
     *
     * @example
     * const quote = await bayse.markets.getQuote('a1b2c3d4-...', 'b1c2d3e4-...', { outcomeId: 'c1d2e3f4-...', quantity: 10 });
     */
    async getQuote(eventId: string, marketId: string, body: QuoteBody): Promise<QuoteResponse> {
        return this.client.post(`/v1/pm/events/${eventId}/markets/${marketId}/quote`, body);
    }

}