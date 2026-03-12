import WebSocket from 'ws';

export class MarketsStream {
    private ws: WebSocket | null = null;
    private url = 'wss://socket.bayse.markets/ws/v1/markets';
    private subscriptions: Map<string, (data: unknown) => void> = new Map();
    private reconnectAttempt = 0;
    public onError?: (message: string) => void;







    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                console.log('[bayse-sdk] WebSocket connected');
                this.reconnectAttempt = 0;
                resolve(); // ← connection is ready, tell the awaiter
            });

            this.ws.on('message', (data) => {
                this.handleMessage(data.toString());
            });

            this.ws.on('close', () => {
                console.log('[bayse-sdk] WebSocket disconnected. Reconnecting...');
                this.reconnect();
            });

            this.ws.on('error', (error) => {
                console.error('[bayse-sdk] WebSocket error:', error.message);
                reject(error); // ← connection failed, tell the awaiter
            });
        });
    }

    subscribeActivity(eventId: string, callback: (data: unknown) => void): void {
        // subscribe to activity channel
        this.subscriptions.set(`activity:${eventId}`, callback);
        this.ws?.send(JSON.stringify({
            type: 'subscribe',
            channel: 'activity',
            eventId,
        }));
    }

    subscribePrices(eventId: string, callback: (data: unknown) => void): void {
        // subscribe to prices channel
        this.subscriptions.set(`prices:${eventId}`, callback);

        // Tell Bayse we want price updates for this event
        this.ws?.send(JSON.stringify({
            type: 'subscribe',
            channel: 'prices',
            eventId,
        }));
    }

    subscribeOrderbook(marketIds: string[], currency: 'USD' | 'NGN' = 'USD', callback: (data: unknown) => void): void {
        // subscribe to orderbook channel
        this.subscriptions.set(`orderbook:${marketIds[0]}`, callback);
        // Tell Bayse we want price updates for this event
        this.ws?.send(JSON.stringify({
            type: 'subscribe',
            channel: 'orderbook',
            marketIds,
            currency
        }));
    }

    unsubscribe(room: string): void {
        // unsubscribe from a room
        this.subscriptions.delete(room);
        this.ws?.send(JSON.stringify({
            type: 'unsubscribe',
            room
        }));
    }

    disconnect(): void {
        this.subscriptions.clear();  // remove all callbacks
        this.ws?.close();            // close the connection
        this.ws = null;              // clean up the reference
    }

    private handleMessage(raw: string): void {
        for (const line of raw.split('\n')) {
            if (!line.trim()) continue;

            try {
                const msg = JSON.parse(line);

                // Find which subscription this message belongs to
                // and call its callback with the data
                this.subscriptions.forEach((callback, room) => {
                    if (msg.type === 'price_update' && room.startsWith('prices:')) {
                        callback(msg.data);
                    } else if ((msg.type === 'buy_order' || msg.type === 'sell_order') && room.startsWith('activity:')) {
                        callback(msg.data);
                    } else if (msg.type === 'orderbook_update' && room.startsWith('orderbook:')) {
                        callback(msg.data);
                    }
                });

                if (msg.type === 'error') {
                    const errorMessage = msg.data?.message ?? 'Unknown WebSocket error';
                    console.error('[bayse-sdk] WebSocket error from server:', errorMessage);
                    this.onError?.(errorMessage); // ← call developer's error handler if set
                    continue;
                }

            } catch {
                console.error('[bayse-sdk] Failed to parse message:', line);
            }
        }
    }

    private reconnect(): void {
        // exponential backoff reconnect
        const delay = Math.min(Math.pow(2, this.reconnectAttempt), 30) * 1000;
        this.reconnectAttempt++;

        console.log(`[bayse-sdk] Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempt})`);

        // Wait, then hand off to connect()
        setTimeout(() => {
            this.connect();
        }, delay);

    }
}
