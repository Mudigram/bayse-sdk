// ============================================================
// Bayse SDK — TypeScript Type Definitions
// Every interface maps directly to the Bayse API response shape
// ============================================================

// --- Config ---------------------------------------------------

export interface BayseConfig {
    publicKey: string;
    secretKey: string;
    baseUrl?: string; // defaults to https://relay.bayse.markets
}

// --- Pagination -----------------------------------------------

export interface Pagination {
    page: number;
    size: number;
    lastPage: number;
    totalCount: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

// --- Events & Markets -----------------------------------------

export type EventStatus = 'open' | 'closed' | 'resolved' | 'cancelled' | 'paused' | 'draft';
export type EventType = 'single' | 'combined' | 'grouped';
export type MarketEngine = 'AMM' | 'CLOB';
export type Currency = 'USD' | 'NGN';
export type OrderSide = 'BUY' | 'SELL';
export type OrderOutcome = 'YES' | 'NO';

export interface Market {
    id: string;
    title: string;
    status: EventStatus;
    outcome1Id: string;
    outcome1Label: string;
    outcome1Price: number;
    outcome2Id: string;
    outcome2Label: string;
    outcome2Price: number;
    yesBuyPrice: number;
    noBuyPrice: number;
    feePercentage: number;
    totalOrders: number;
    rules: string;
    // Only on crypto markets
    marketThreshold?: number;
    marketThresholdRange?: string;
    marketCloseValue?: number;
}

export interface Event {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    type: EventType;
    engine: MarketEngine;
    status: EventStatus;
    openingDate?: string;
    resolutionDate: string;
    closingDate: string;
    imageUrl: string;
    liquidity: number;
    totalVolume: number;
    totalOrders: number;
    supportedCurrencies: Currency[];
    userWatchlisted: boolean;
    markets: Market[];
    // Only on crypto events
    assetSymbolPair?: string;
    eventThreshold?: number;
    eventThresholdRange?: string;
    eventCloseValue?: number;
    seriesSlug?: string;
}

// --- Orders ---------------------------------------------------

export type OrderStatus =
    | 'pending'
    | 'open'
    | 'partial_filled'
    | 'filled'
    | 'cancelled'
    | 'rejected'
    | 'expired';

export interface AmmOrder {
    id: string;
    outcome: OrderOutcome;
    side: OrderSide;
    type: string;
    status: string;
    amount: number;
    price: number;
    quantity: number;
    currency: Currency;
    createdAt: string;
    updatedAt: string;
}

export interface ClobOrder {
    id: string;
    marketId: string;
    userId: string;
    outcome: OrderOutcome;
    side: OrderSide;
    orderType: 'LIMIT' | 'MARKET';
    type: string;
    status: OrderStatus;
    amount: number;
    price: number;
    size: number;
    filledSize: number;
    remainingSize: number;
    avgFillPrice: number;
    fee: number;
    postOnly: boolean;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface PlaceOrderResponse {
    engine: MarketEngine;
    ammOrder?: AmmOrder;
    clobOrder?: ClobOrder;
}

export interface PlaceOrderBody {
    side: OrderSide;
    outcome: OrderOutcome;
    amount: number;
    currency?: Currency;
    price?: number; // CLOB only — limit price
}

// --- Quote ----------------------------------------------------

export interface QuoteBody {
    side: OrderSide;
    outcome: OrderOutcome;
    amount: number;
    currency?: Currency;
}

export interface QuoteResponse {
    price: number;               // the execution price
    amount: number;              // amount you're spending
    fee: number;                 // trading fee
    quantity: number;            // shares you'll receive
    currentMarketPrice: number;  // current YES/NO price
    costOfShares: number;        // total cost
    profitPercentage: number;    // potential profit %
    completeFill: boolean;       // will order fill completely
    priceImpactAbsolute: number; // how much your order moves the price
    currencyBaseMultiplier: number;
    tradeGoesOverMaxLiability: boolean;
}

// --- Portfolio & Positions ------------------------------------

export interface Position {
    marketId: string;
    eventId: string;
    outcome: OrderOutcome;
    shares: number;
    avgPrice: number;
    currentValue: number;
    unrealizedPnl: number;
}

export interface Portfolio {
    positions: Position[];
}

export interface Activity {
    id: string;
    marketId: string;
    eventId: string;
    side: OrderSide;
    outcome: OrderOutcome;
    amount: number;
    price: number;
    currency: Currency;
    createdAt: string;
}

// --- Wallet ---------------------------------------------------

export interface WalletAddress {
    id: string;
    address: string;
    asset: string;
    network: string;
    provider: string;
    symbol: string;
    createdAt: string;
    updatedAt: string;
    user: string;
}

export interface WalletAsset {
    id: string;
    symbol: string;
    network: string;
    availableBalance: number;
    pendingBalance: number;
    isDefault: boolean;
    isLocalCurrencyAsset: boolean;
    depositActivity: string;
    wagerActivity: string;
    withdrawalActivity: string;
    addresses: WalletAddress[];
    userId: string;
    createdAt: string;
    updatedAt: string;
}

// --- List Events Params ---------------------------------------

export interface ListEventsParams {
    page?: number;
    size?: number;
    category?: string;
    subcategory?: string;
    status?: EventStatus;
    keyword?: string;
    currency?: Currency;
    trending?: boolean;
    watchlist?: boolean;
    seriesSlug?: string;
}


export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

export interface ListOrdersParams {
    page?: number;
    size?: number;
    status?: OrderStatus;
}

// --- Errors ---------------------------------------------------

export class BayseApiError extends Error {
    constructor(
        public statusCode: number,
        public errorCode: string,
        message: string
    ) {
        super(message);
        this.name = 'BayseApiError';
    }
}

export class BayseAuthError extends BayseApiError {
    constructor(message: string) {
        super(401, 'unauthorized', message);
        this.name = 'BayseAuthError';
    }
}

export class BayseRateLimitError extends BayseApiError {
    constructor(public retryAfter: number) {
        super(429, 'rate_limit_exceeded', `Rate limited. Retry after ${retryAfter}s`);
        this.name = 'BayseRateLimitError';
    }
}

export class BayseNotFoundError extends BayseApiError {
    constructor(message: string) {
        super(404, 'not_found', message);
        this.name = 'BayseNotFoundError';
    }
}

// --- Ticker ---------------------------------------------------
export interface Ticker {
    marketId: string;
    outcomeId: string;
    lastPrice: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    priceChange24h: number;
}

// --- Order Book -----------------------------------------------
export interface OrderBookLevel {
    price: number;
    quantity: number;
    total: number;
}

export interface OrderBook {
    marketId: string;
    outcomeId: string;
    timestamp: string;
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    lastTradedPrice: number;
    lastTradedSide: 'BUY' | 'SELL';
}

// --- Trades ---------------------------------------------------
export interface Trade {
    id: string;
    marketId: string;
    outcomeId: string;
    side: OrderSide;
    price: number;
    quantity: number;
    amount: number;
    currency: Currency;
    createdAt: string;
}

export interface ListTradesParams {
    marketId?: string;
    outcomeId?: string;
    page?: number;
    size?: number;
}

// --- Order Book Params ----------------------------------------
export interface GetOrderBookParams {
    outcomeIds: string[];
    currency?: Currency;
}