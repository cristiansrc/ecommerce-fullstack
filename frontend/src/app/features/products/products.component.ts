import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from './product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush, // Best practice for performance
  template: `
    <div class="container">
      <h1>Catálogo de Productos</h1>
      
      <!-- Loading State with @if (Angular 17+ control flow) -->
      @if (loading()) {
        <p class="loading">Cargando productos...</p>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="error">
          <p>{{ error() }}</p>
        </div>
      }

      <!-- Empty State -->
      @else if (!hasProducts()) {
        <p>No hay productos disponibles.</p>
      }

      <!-- Product List with trackBy pattern (performance) -->
      @for (product of products(); track product.id) {
        <div class="card">
          @if (product.imageUrl) {
            <img [src]="product.imageUrl" alt="{{ product.name }}">
          }
          
          <h3>{{ product.name }}</h3>
          @if (product.description) {
            <p>{{ product.description }}</p>
          }
          <div class="price">$ {{ (product.price / 100).toFixed(2) }}</div>
          <span class="stock">Stock: {{ product.stock }} un.</span>
        </div>
      }
    </div>

    <!-- Pagination Controls -->
    <div class="pagination">
      <button (click)="loadProducts(page() - 1)" [disabled]="page() <= 0">Anterior</button>
      <span>Página {{ page() + 1 }}</span>
      <button (click)="loadProducts(page() + 1)">Siguiente</button>
    </div>
  `
})
export class ProductsComponent {
  // Signals for local component state
  products = inject(ProductService).productsSignal;
  loading = inject(ProductService).loadingSignal;
  error = inject(ProductService).errorSignal;
  hasProducts = inject(ProductService).hasProducts;
  
  page = signal(0);
  
  private productService = inject(ProductService);

  constructor() {
    this.loadProducts();
  }

  loadProducts(page: number = 0) {
    this.page.set(page);
    this.productService.getProducts(page, 10);
  }
}