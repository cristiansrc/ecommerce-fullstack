import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './features/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="main-header">
      <h1>E-Commerce Learning</h1>
      
      @if (isLoggedIn()) {
        <nav class="auth-nav">
          <span class="user-info">Hola, {{ currentUser()?.email }}</span>
          <a routerLink="/cart" class="btn-cart">🛒 Carrito</a>
          <button (click)="logout()" class="btn-logout">Salir</button>
        </nav>
      } @else {
        <nav class="auth-nav">
          <a routerLink="/login" class="btn-primary">Ingresar</a>
          <a routerLink="/register" class="btn-secondary">Registrarse</a>
        </nav>
      }
    </header>
    
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    '.main-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background-color: #343a40; color: white; }',
    '.auth-nav { display: flex; gap: 1rem; align-items: center; }',
    '.user-info { margin-right: 1rem; font-size: 0.9rem; opacity: 0.9; }',
    'a, button { text-decoration: none; color: inherit; border: none; cursor: pointer; padding: 0.5rem 1rem; border-radius: 4px; transition: background-color 0.2s; }',
    '.btn-primary { background-color: #0066cc; color: white; } .btn-primary:hover { background-color: #0052a3; }',
    '.btn-secondary { background-color: #6c757d; color: white; } .btn-secondary:hover { background-color: #5a6268; }',
    '.btn-cart { background-color: #28a745; color: white; display: flex; align-items: center; gap: 0.5rem; }',
    '.main-content { padding: 2rem; min-height: calc(100vh - 60px); }'
  ]
})
export class AppComponent {
  private authService = inject(AuthService);
  
  isLoggedIn = () => this.authService.isLoggedIn();
  currentUser = () => this.authService.currentUser();

  async logout() {
    await this.authService.logout();
  }
}
})
export class AppComponent {}