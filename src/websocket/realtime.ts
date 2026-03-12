import WebSocket from 'ws';

export class RealtimeStream {
    private ws: WebSocket | null = null;
    private url = 'wss://socket.bayse.markets/ws/v1/realtime';
    private subscriptions: Map<string, (data: unknown) => void> = new Map();
    private reconnectAttempt = 0;


    connect(): void {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
            console.log('[bayse-sdk] WebSocket connected');
            this.reconnectAttempt = 0;
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
        });
    }

    private handleMessage(raw: string): void {
        for (const line of raw.split('\n')) {
            if (!line.trim()) continue;

            try {
                const msg = JSON.parse(line);

                // Only one message type on this endpoint
                if (msg.type === 'asset_price') {
                    this.subscriptions.forEach((callback, room) => {
                        if (room.startsWith('asset_prices:')) {
                            callback(msg.data);
                        }
                    });
                }

            } catch {
                console.error('[bayse-sdk] Failed to parse message:', line);
            }
        }
    }

    subscribeAssetPrices(symbols: string[], callback: (data: unknown) => void): void {

        this.subscriptions.set(`asset_prices:${symbols[0]}`, callback);
        this.ws?.send(JSON.stringify({
            type: 'subscribe',
            channel: 'asset_prices',
            symbols,
        }));
    }

    disconnect(): void {
        this.subscriptions.clear();  // remove all callbacks
        this.ws?.close();            // close the connection
        this.ws = null;              // clean up the reference
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