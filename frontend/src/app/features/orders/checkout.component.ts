import { Component, inject, signal, Effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Services
import { OrderService, OrderStatus, OrderItem } from './order.service';

export interface CheckoutOrder {
  id: number;
  status: string;
  totalAmount: number;
  items: Array<{ productId: number; quantity: number }> | null;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  changeDetection: 'OnPush',
  template: `
    <div class="checkout-container">
      <!-- Estado cargando -->
      @if (loading()) {
        <div class="loading-spinner">Procesando orden...</div>
      }

      <!-- Error global -->
      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      <!-- Orden creada exitosamente -->
      @if (orderCreated()) {
        <div class="success-card">
          <h2>✅ Orden Creada Exitosamente</h2>
          <p>Número de orden: #{{ orderCreated()!.id }}</p>
          <p>Total a pagar: ${{ orderCreated()!.totalAmount }}</p>
          @if (orderCreated()?.items) {
            <ul class="checkout-items">
              @for (item of orderCreated()!.items; track item.productId) {
                <li>Producto ID: {{ item.productId }} - x{{ item.quantity }}</li>
              }
            </ul>
          }
          <button (click)="goToOrders()" class="btn btn-primary">Ver mis órdenes</button>
        </div>
      }

      <!-- Vista inicial del checkout -->
      @if (!loading() && !orderCreated()) {
        <h2>Finalizar Compra</h2>
        <p>Haga clic en Procesar para convertir su carrito actual en una orden.</p>
        <button (click)="processOrder()" class="btn btn-success">Procesar Orden</button>
        @if (!loading()) {
          <router-outlet></router-outlet>
        }
      }
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .loading-spinner {
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
    .success-card {
      background-color: #e8f5e9;
      border: 1px solid #4caf50;
      padding: 2rem;
      border-radius: 8px;
    }
    .checkout-items {
      margin: 1rem 0;
      list-style: none;
      padding: 0;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary { background-color: #2196f3; color: white; }
    .btn-success { background-color: #4caf50; color: white; }
  `]
})
export class CheckoutComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);
  
  // Signals para estado
  loading = signal(false);
  error = signal<string | null>(null);
  orderCreated = signal<CheckoutOrder | null>(null); // null o el orden creada

  constructor() {
    // Efecto: Si hay un usuario autenticado, cargar sus órdenes (opcional)
    Effect(() => {
      console.log('Checkout state:', { loading: this.loading(), error: this.error(), orderCreated: !!this.orderCreated() });
    });
  }

  async processOrder() {
    if (!confirm('¿Convertir su carrito actual en una orden?')) return;
    
    this.loading.set(true);
    this.error.set(null);
    
    // Obtener userId del localStorage (debería estar sincronizado con auth)
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.error.set('Debes iniciar sesión para crear una orden');
      this.loading.set(false);
      return;
    }

    // Extraer userId del JWT (simplificado - debería venir del auth service)
    // En producción: usar AuthInterceptor o auth service
    const userId = 1; // TODO: Obtener del authService.currentUser()?.id || null
    
    try {
      const order = await this.orderService.processCart(userId!).toPromise();
      this.orderCreated.set(order);
    } catch (err: any) {
      console.error('Error procesando orden:', err);
      this.error.set(err.message || 'Error al crear la orden');
    } finally {
      this.loading.set(false);
    }
  }

  goToOrders() {
    // Usar Router para navegación SPA correcta (evitar recarga)
    this.router.navigate(['/orders']);
  }
}
