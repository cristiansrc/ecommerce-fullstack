import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { ProductService } from '../products/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-container">
      @if (!isLoggedIn()) {
        <div class="auth-message">
          <h2>Acceso Requerido</h2>
          <p>Necesitas iniciar sesión para usar el carrito.</p>
          <a [routerLink]="['/login']">Ir a Login</a>
        </div>
      } @else {
        <div class="cart-header">
          <h1>Mi Carrito</h1>
          <button (click)="logout()" class="btn-secondary">Cerrar Sesión</button>
        </div>

        <p>Carrito del usuario: {{ currentUser()?.email }}</p>
        
        <!-- Aquí iría la lógica real de mostrar items del carrito -->
        @if (!hasCart()) {
          <div class="empty-cart">
            <p>Tu carrito está vacío.</p>
            <a [routerLink]="['/products']">Ver productos</a>
          </div>
        }
      }
    </div>
  `,
  styles: [
    '.cart-container { max-width: 800px; margin: 2rem auto; padding: 2rem; }',
    '.auth-message { text-align: center; margin-top: 4rem; }',
    '.cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }',
    '.btn-secondary { background-color: #6c757d; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }'
  ]
})
export class CartComponent {
  private authService = inject(AuthService);
  
  isLoggedIn = () => this.authService.isLoggedIn();
  currentUser = () => this.authService.currentUser();
  hasCart = signal<boolean>(false); // TODO: conectar con cart service real

  async logout() {
    await this.authService.logout();
  }
}