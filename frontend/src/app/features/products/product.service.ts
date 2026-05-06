import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, PaginatedProducts } from './models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = '/api/products';

  // Signals for reactive state management
  productsSignal = signal<Product[]>([]);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  // Computed: derived state from signals (auto-updates when dependencies change)
  readonly hasProducts = computed(() => this.productsSignal().length > 0);
  readonly isLoading = computed(() => this.loadingSignal());

  constructor(private http: HttpClient) {}

  getProducts(page = 0, size = 10) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PaginatedProducts>(`${this.apiUrl}?page=${page}&size=${size}`)
      .subscribe({
        next: (data) => {
          this.productsSignal.set(data.content);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          console.error('Error fetching products:', err);
          this.errorSignal.set(err.message || 'Failed to load products');
          this.loadingSignal.set(false);
        }
      });
  }
}