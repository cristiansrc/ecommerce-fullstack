import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  changeDetection: 'OnPush',
  template: `
    <div class="order-detail">
      <h2>Detalle de Orden #{{ orderId }}</h2>

      @if (loading()) {
        <p>Cargando...</p>
      }

      @if (!loading() && order()) {
        <div class="order-info">
          <p><strong>Estado:</strong> {{ translateStatus(order()!.status) }}</p>
          <p><strong>Total:</strong> ${{ order()!.totalAmount }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(order()!.createdAt) }}</p>
        </div>

        <h3>Items</h3>
        @if (order()?.items) {
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              @for (item of order()!.items; track item.id) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>${{ item.unitPrice }}</td>
                  <td>${{ calculateSubtotal(item.quantity, item.unitPrice) }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
  styles: [`
    .order-detail { padding: 2rem; max-width: 800px; margin: 0 auto; }
    h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 1rem; }
    h3 { color: #555; margin-top: 2rem; }
    .order-info { background-color: #f8f9fa; padding: 1.5rem; border-radius: 8px; }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .items-table th, .items-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .items-table th { background-color: #e9ecef; font-weight: bold; }
    .loading-spinner { text-align: center; color: #3498db; }
  `]
})
export class OrderDetailComponent {
  private route = inject(Router);
  
  orderId = 0;
  loading = signal(true);
  order = signal(null);

  ngOnInit() {
    // TODO: Obtener ID del route params y cargar detalle
    this.orderId = +this.route.snapshot.paramMap.get('id');
  }

  translateStatus(status: string): string {
    return status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  calculateSubtotal(qty: number, price: any): string {
    const p = typeof price === 'number' ? price : parseFloat(price) || 0;
    return (qty * p).toFixed(2);
  }
}