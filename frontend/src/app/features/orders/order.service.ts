import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number; // BigDecimal como number/string?
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: number;
  userId: number;
  userEmail?: string;
  status: OrderStatus;
  totalAmount: number; // BigDecimal como string en JSON pero usaremos number o string
  createdAt: string; // ISO date
  items: Array<OrderItem>;
}

export interface CartOrder {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: Array<{ productId: number, quantity: number }> | null; // Simplificado para checkout
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  // Signals para state management (consistente con proyecto 2)
  private _ordersSignal = signal<Order[]>([]);
  private _loadingSignal = signal<boolean>(false);
  private _errorSignal = signal<string | null>(null);

  readonly ordersSignal = this._ordersSignal;
  readonly loadingSignal = this._loadingSignal;
  readonly errorSignal = this._errorSignal;

  // Computed
  readonly activeOrders = computed(() => 
    this.ordersSignal().filter(o => o.status !== OrderStatus.CANCELLED)
  );

  constructor(private http: HttpClient) {}

  /** Procesar carrito actual -> Crear orden */
  processCart(userId: number): Observable<CartOrder> {
    return this.http.post<CartOrder>(`${this.apiUrl}`, { params: { userId } });
  }

  /** Listar órdenes del usuario */
  async listOrders(userId: number): Promise<void> {
    try {
      this._loadingSignal.set(true);
      this._errorSignal.set(null);
      const response = await this.http.get<Order[]>(`${this.apiUrl}?userId=${userId}`).toPromise();
      if (response) {
        // Ordenar por fecha más reciente primero
        response.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this._ordersSignal.set(response);
      }
    } catch (error: any) {
      console.error('Error listando órdenes:', error);
      this._errorSignal.set(error.message || 'Error al cargar órdenes');
    } finally {
      this._loadingSignal.set(false);
    }
  }

  /** Confirmar orden */
  confirmOrder(userId: number, orderId: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/confirmar`, {}, { params: { userId } });
  }

  /** Cancelar orden (restaura stock) */
  cancelOrder(userId: number, orderId: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/cancelar`, {}, { params: { userId } })
      .pipe(
        // Actualizar localmente tras cancelar
        map(order => {
          const orders = [...this.ordersSignal()];
          const idx = orders.findIndex(o => o.id === order.id);
          if (idx !== -1) orders[idx] = order;
          this._ordersSignal.set(orders);
          return order;
        })
      );
  }

  /** Limpiar estado local */
  clear() {
    this._ordersSignal.set([]);
    this._loadingSignal.set(false);
    this._errorSignal.set(null);
  }
}