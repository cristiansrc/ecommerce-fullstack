import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// Router para navegación a detalle de orden
import { Router } from '@angular/router';

// CDK Virtual Scroll para performance con listas largas (Proyecto 3 requirement)
import { CdkVirtualScrollModule, ScrollingStrategy, ItemSizeDispatcher } from '@angular/cdk/scrolling';

// Services y tipos
import { OrderService, OrderStatus } from './order.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule], // RouterOutlet para child routes

  changeDetection: 'OnPush',
  template: `
    <div class="orders-container">
      <h2>Mis Órdenes</h2>

      <!-- Loading -->
      @if (orderService.loading()) {
        <div class="loading">Cargando órdenes...</div>
      }

      <!-- Error -->
      @if (orderService.error()) {
        <div class="alert alert-danger">{{ orderService.error() }}</div>
      }

      <!-- Lista vacía -->
      @if (!orderService.loading() && !orderService.error() && orderService.ordersSignal().length === 0) {
        <p>No tiene órdenes registradas aún.</p>
      }

      <!-- CDK Virtual Scroll para listas largas (performance optimization) -->
      @if (!orderService.loading() && !orderService.error() && orderService.ordersSignal().length > 0) {
        
        <router-outlet></router-outlet>
        
        <div class="virtual-scroll-container" cdkVirtualScroll [cdkVirtualScrollGetItemSize]="getItemSize$">
          @for (order of orderService.ordersSignal(); track order.id; let i = $index) {
            <div class="order-card {{ getStatusClass(order.status) }}" style="height: 180px; position: relative;"> <!-- Fixed height para CDK -->
              
              <div class="order-header">
                <h3>Orden #{{ order.id }}</h3>
                <span class="badge status-{{ getStatusClass(order.status) }}">{{ translateStatus(order.status) }}</span>
              </div>

              <p><strong>Total:</strong> ${{ order.totalAmount }}</p>
              <p class="date">Creado: {{ formatDate(order.createdAt) }}</p>

              <div class="order-items">
                @if (order.items && order.items.length > 0) {
                  <small>{{ order.items.length }} item(s)</small>
                  @for (item of order.items; track item.id; let idx = $index; stopAfter: 2) {
                    <ul><li>- {{ item.productName }} x{{ item.quantity }}</li></ul>
                  }
                  @if (order.items.length > 2) {
                    <small>+{{ order.items.length - 2 }} más...</small>
                  }
                }
              </div>

              <!-- Acciones -->
              <div class="order-actions">
                @if (order.status === OrderStatus.PENDING) {
                  <button class="btn btn-success" (click)="confirmOrder(order.id)">Confirmar</button>
                  <button class="btn btn-danger" (click)="cancelOrder(order.id, true)">Cancelar</button>
                }
                @else if (order.status === OrderStatus.CONFIRMED) {
                  <button class="btn btn-danger" (click)="cancelOrder(order.id, true)">Cancelar</button>
                }
                <a routerLink="/orders/{{ order.id }}/detalle" class="btn btn-secondary">Ver detalles</a>
              </div>

            </div>
          }
        </div>

      }
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    h2 { 
      text-align: center; 
      color: #333;
      margin-bottom: 2rem;
    }
    .loading {
      text-align: center;
      font-size: 1.2em;
      color: #3498db;
    }
    .alert-danger {
      background-color: #ffebee;
      color: #c62828;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    /* CDK Virtual Scroll container */
    .virtual-scroll-container {
      height: 70vh; /* Altura fija necesaria para virtual scroll */
      overflow-y: auto;
      background-color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .order-card {
      border: 1px solid #ddd;
      margin-bottom: 1rem;
      border-radius: 8px;
      padding: 1.5rem;
      background-color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .order-card.pending { border-left: 4px solid #ffc107; }
    .order-card.confirmed { border-left: 4px solid #4caf50; background-color: #e8f5e9; }
    .order-card.shipped { border-left: 4px solid #2196f3; }
    .order-card.delivered { border-left: 4px solid #9e9e9e; opacity: 0.7; }
    .order-card.cancelled { border-left: 4px solid #f44336; background-color: #ffebee; }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    h3 { color: #333; }
    
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-pending { background-color: #fff3cd; color: #856404; }
    .status-confirmed { background-color: #d4edda; color: #155724; }
    .status-shipped { background-color: #cce5ff; color: #0c5460; }
    .status-delivered { background-color: #e2e3e5; color: #383d44; }
    .status-cancelled { background-color: #f8d7da; color: #721c24; }

    .order-items {
      margin: 1rem 0;
      font-size: 0.9em;
      color: #666;
    }
    .date { color: #888; font-size: 0.85em; }

    .order-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
    }
    .btn-success { background-color: #28a745; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
  `]
})
export class OrdersListComponent {
  private orderService = inject(OrderService);
  
  // CDK Virtual Scroll configuration
  readonly getItemSize$ = (index: number) => 180; // Altura fija por item para performance

  OrderStatus = OrderStatus;

  constructor() {}

  /** Obtener órdenes al cargar */
  async ngOnInit() {
    // TODO: Inyectar AuthService para obtener userId real
    const userId = localStorage.getItem('user_id'); // Simplificado
    if (userId) {
      await this.orderService.listOrders(+userId);
    }
  }

  translateStatus(status: OrderStatus): string {
    return status;
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  async confirmOrder(orderId: number) {
    if (!confirm('Confirmar esta orden?')) return;
    
    // TODO: Obtener userId real del auth service
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      await this.orderService.confirmOrder(+userId, orderId).toPromise();
      console.log('Orden confirmada:', orderId);
      // Recargar lista
      await this.orderService.listOrders(+userId);
    } catch (err: any) {
      alert(err.message || 'Error confirmando orden');
    }
  }

  async cancelOrder(orderId: number, confirmCancel: boolean = true) {
    if (confirmCancel && !confirm('Cancelar esta orden? El stock se restaurará automáticamente.')) return;
    
    // TODO: Obtener userId real del auth service
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      await this.orderService.cancelOrder(+userId, orderId).toPromise();
      console.log('Orden cancelada:', orderId);
    } catch (err: any) {
      alert(err.message || 'Error cancelando orden');
    }
  }
}
