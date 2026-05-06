import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

/**
 * Interceptor que añade el JWT token al header Authorization
 * Pattern: Bearer <token>
 */
export async function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Promise<HttpEvent<unknown>> {
  const token = localStorage.getItem('auth_token');
  
  // Si tenemos token, añadirlo al header Authorization
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }
  
  return next(req);
}