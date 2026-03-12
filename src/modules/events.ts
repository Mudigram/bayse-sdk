import { BayseHttpClient } from '../client';
import { Event, ListEventsParams, Pagination } from '../types';
import { validateId } from '../utils';

// ============================================================
// Events Module
//
// Covers all /v1/pm/events endpoints.
// Events are the top-level container — each event has one or
// more markets, each market has two outcomes (YES/NO).
// ============================================================

interface ListEventsResponse {
    events: Event[];
    pagination: Pagination;
}

export class EventsModule {
    constructor(private client: BayseHttpClient) { }

    /**
     * List all prediction market events.
     * Filter by category, status, keyword, trending, etc.
     *
     * Public endpoint — no auth required, but passing your
     * public key enables watchlist status on each event.
     *
     * @example
     * const { events } = await bayse.events.getAll({ category: 'sports', status: 'open' })
     */
    async getAll(params?: ListEventsParams): Promise<ListEventsResponse> {
        return this.client.get<ListEventsResponse>('/v1/pm/events', params as Record<string, unknown>);
    }

    /**
     * Get a single event by its UUID.
     *
     * @example
     * const event = await bayse.events.getById('a1b2c3d4-...')
     */
    async getById(eventId: string): Promise<Event> {
        validateId(eventId, 'eventId'); // ← add this
        return this.client.get<Event>(`/v1/pm/events/${eventId}`);
    }

    /**
     * Get a single event by its slug (human-readable URL identifier).
     *
     * @example
     * const event = await bayse.events.getBySlug('super-eagles-afcon-2026')
     */
    async getBySlug(slug: string): Promise<Event> {
        validateId(slug, 'slug');
        return this.client.get<Event>(`/v1/pm/events/slug/${slug}`);
    }

    /**
     * Get price history for all markets in an event.
     * Useful for drawing price charts.
     *
     * @example
     * const history = await bayse.events.getPriceHistory('a1b2c3d4-...')
     */
    async getPriceHistory(eventId: string, params?: { from?: string; to?: string }): Promise<unknown> {
        return this.client.get(`/v1/pm/events/${eventId}/price-history`, params as Record<string, unknown>);
    }

    /**
     * List all available event series.
     * A series is a group of recurring events e.g. "BTC 1h price predictions"
     *
     * @example
     * const { series } = await bayse.events.listSeries({ page: 1, size: 10 })
     */
    async listSeries(params?: { page?: number; size?: number }): Promise<unknown> {
        return this.client.get('/v1/pm/series', params as Record<string, unknown>);
    }


    /**
     * Get all events belonging to a specific series.
     *
     * @example
     * const events = await bayse.events.getSeriesEvents('crypto-btc-1h')
     */
    async getSeriesEvents(
        seriesSlug: string,
        params?: ListEventsParams
    ): Promise<{ events: Event[]; pagination: Pagination }> {
        return this.client.get(
            `/v1/pm/series/${seriesSlug}/events`,
            params as Record<string, unknown>
        );
    }
}