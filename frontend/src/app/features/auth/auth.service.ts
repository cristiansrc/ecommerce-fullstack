import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginCredentials, RegisterCredentials, AuthUser } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal-based state management (Angular 17+)
  userSignal = signal<AuthUser | null>(null);
  isAuthenticatedSignal = signal<boolean>(false);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  // Computed: derivado del estado base
  readonly isLoggedIn = computed(() => this.isAuthenticatedSignal());
  readonly currentUser = computed(() => this.userSignal());

  private readonly apiUrl = '/api/auth';
  
  constructor(private http: HttpClient, private router: Router) {
    // Cargar token guardado al iniciar app (persistencia)
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.isAuthenticatedSignal.set(true);
      // Opcional: guardar token en signal si quieres acceso reactivo inmediato
    }
  }

  async login(credentials: LoginCredentials): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http.post<string>(`${this.apiUrl}/login`, credentials).toPromise();
      
      // Guardar token en localStorage (persistencia)
      localStorage.setItem('auth_token', response);
      
      // Actualizar estado reactivo con Signals
      this.userSignal.set({
        userId: Date.now(), // Opcional: podrías extraer de claims del JWT decodificado
        email: credentials.email,
        role: 'CUSTOMER' as const, // Por defecto CUSTOMER
        token: response
      });
      this.isAuthenticatedSignal.set(true);

      await this.router.navigate(['/products']); // Redirigir al catálogo
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Credenciales inválidas');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const token = await this.http.post<string>(`${this.apiUrl}/register`, credentials).toPromise();
      
      localStorage.setItem('auth_token', token);
      
      this.userSignal.set({
        userId: Date.now(),
        email: credentials.email,
        role: 'CUSTOMER' as const,
        token
      });
      this.isAuthenticatedSignal.set(true);

      await this.router.navigate(['/products']);
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Registro fallido');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.errorSignal.set(null);
    await this.router.navigate(['/login']);
  }
}