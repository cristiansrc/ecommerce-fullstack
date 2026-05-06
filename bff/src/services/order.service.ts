import axios from 'axios';

export interface OrderDTO {
  id: number;
  userId: number;
  userEmail?: string;
  status: OrderStatus;
  totalAmount: string; // BigDecimal como string
  createdAt: string; // ISO date
  items: Array<OrderItemResponse>;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItemResponse {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string; // BigDecimal como string
}

export class OrderService {
  private readonly apiClient = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:8080/api',
    timeout: 10000, // Mayor timeout para transacciones complejas
  });

  /**
   * Procesa el carrito actual del usuario creando una nueva orden.
   * Reduce stock automáticamente via SQL trigger.
   */
  async processCart(userId: number) {
    const response = await this.apiClient.post('/orders', null, {
      params: { userId }
    });
    return response.data;
  }

  /**
   * Lista todas las órdenes del usuario.
   */
  async listOrders(userId: number) {
    const response = await this.apiClient.get('/orders', {
      params: { userId }
    });
    return response.data;
  }

  /**
   * Detalle de una orden específica.
   */
  async getOrder(userId: number, orderId: number) {
    const response = await this.apiClient.get(`/orders/${orderId}`, {
      params: { userId }
    });
    return response.data;
  }

  /**
   * Confirma una orden cambiando status a CONFIRMED.
   */
  async confirmOrder(userId: number, orderId: number) {
    const response = await this.apiClient.patch(`/orders/${orderId}/confirmar`, null, {
      params: { userId }
    });
    return response.data;
  }

  /**
   * Cancela una orden cambiando status a CANCELLED.
   * El stock se restaura automáticamente via SQL trigger.
   */
  async cancelOrder(userId: number, orderId: number) {
    const response = await this.apiClient.patch(`/orders/${orderId}/cancelar`, null, {
      params: { userId }
    });
    return response.data;
  }
}

export const orderService = new OrderService();
