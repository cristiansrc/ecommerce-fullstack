import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <h1>Iniciar Sesión</h1>
      
      @if (error()) {<div class="error">{{ error() }}</div>}
      
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="usuario@email.com">
          @if (submitted() && loginForm.get('email')?.errors) {
            <small class="text-danger">Email inválido o requerido</small>
          }
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" formControlName="password" placeholder="******">
          @if (submitted() && loginForm.get('password')?.errors) {
            <small class="text-danger">Mínimo 6 caracteres requeridos</small>
          }
        </div>

        <button type="submit" [disabled]="loading() || !loginForm.valid()">
          {{ loading() ? 'Autenticando...' : 'Ingresar' }}
        </button>
      </form>

      @if (loading()) {<p>Cargando...</p>}

      <p class="mt-3">
        ¿No tienes cuenta? 
        <a [routerLink]="['/register']">Regístrate aquí</a>
      </p>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 100px auto;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    input[type="email"], input[type="password"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover:not(:disabled) { background-color: #0052a3; }
    .text-danger { color: red; font-size: 0.875rem; margin-top: 0.25rem; }
    .error {
      background-color: #ffebee;
      color: #c62828;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  
  // Signals para estado del componente
  loading = () => this.authService.loadingSignal();
  error = () => this.authService.errorSignal();
  submitted = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private authService: AuthService) {}

  async onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.submitted.set(true);
    try {
      await this.authService.login(this.loginForm.value as any);
    } catch {
      // Error manejado por el service, ya actualizó errorSignal
    }
  }
}