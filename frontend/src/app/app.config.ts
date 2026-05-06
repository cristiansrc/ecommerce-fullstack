import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouterConfigType } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HttpInterceptorFn } from '@angular/common/http';

import { routes } from './routes';
import { authInterceptor } from './features/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(), // Para interceptores de clase (v16)
      [authInterceptor as HttpInterceptorFn] // Para interceptores funcionales (Angular 17+)
    )
  ]
};
