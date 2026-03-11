import { BayseHttpClient } from '../client';
import {
  PlaceOrderBody,
  PlaceOrderResponse,
  PaginatedResponse,
  ClobOrder,
  AmmOrder,
  ListOrdersParams,
} from '../types';

/**
 * Orders Module
 */

export class OrdersModule {
  constructor(private client: BayseHttpClient) { }

  /**
   * Get an order by its UUID.
   *
   * @example
   * const order = await bayse.orders.getById('a1b2c3d4-...')
   */
  async getById(orderId: string): Promise<ClobOrder> {
    return this.client.get<ClobOrder>(`/v1/pm/orders/${orderId}`);
  }

  /**
   * List all orders
   *
   * @example
   * const orders = await bayse.orders.getAll({ page: 1, size: 10 });
   */
  async getAll(params?: ListOrdersParams): Promise<PaginatedResponse<ClobOrder | AmmOrder>> {
    return this.client.get<PaginatedResponse<ClobOrder | AmmOrder>>('/v1/pm/orders', params as Record<string, unknown>);
  }

  /**
   * Place an order
   *
   * @example
   * const order = await bayse.orders.place('a1b2c3d4-...', 'b1c2d3e4-...', {
   *   side: 'BUY',
   *   outcome: 'YES',
   *   amount: 10,
   *   currency: 'USD',
   *   price: 10,
   * });
   */
  async place(eventId: string, marketId: string, body: PlaceOrderBody): Promise<PlaceOrderResponse> {
    return this.client.post<PlaceOrderResponse>(`/v1/pm/events/${eventId}/markets/${marketId}/orders`, body);
  }

  /**
   * Cancel an order
   *
   * @example
   * const order = await bayse.orders.cancel('a1b2c3d4-...')
   */
  async cancel(orderId: string): Promise<unknown> {
    return this.client.delete(`/v1/pm/orders/${orderId}`);
  }
}