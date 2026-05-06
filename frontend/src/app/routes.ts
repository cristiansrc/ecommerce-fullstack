import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register', 
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products.component')
      .then(m => m.ProductsComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard], // Rota protegida
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard], // Requiere autenticación para crear órdenes
    loadComponent: () => import('./features/orders/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard], // Lista de órdenes protegida
    loadComponent: () => import('./features/orders/orders-list.component').then(m => m.OrdersListComponent),
    children: [
      { 
        path: ':id/detalle', 
        loadChildren: () => import('./features/orders/order-detail.component')
          .then(m => [m.OrderDetailComponent]) // TODO: Crear componente de detalle
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard], // Requiere autenticación + role ADMIN
    loadComponent: () => import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent)
  }
];