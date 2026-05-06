# GUARDADO: E-Commerce Learning Project

**Fecha:** May 06 2026 (Actualizado)
**Ubicación:** `/home/cristiansrc/Documentos/Proyectos/ecommerce-fullstack`
## ✅ PROYECTO 1 COMPLETADO (100%)
Catálogo de productos CRUD paginado con arquitectura completa:
- **Backend:** Spring Boot + PostgreSQL + Flyway V1 (`ddl-auto=validate`)
- **BFF:** Node.js/Express proxy con TypeScript
- **Frontend:** Angular 19 Standalone + Signals (@if/@for, OnPush, loadComponent)

**Ejecución:** `docker compose up --build`
- Frontend: http://localhost:4200
- API: http://localhost:8080/api/products
- BFF: http://localhost:3000/api/products

## ✅ PROYECTO 2 COMPLETADO (100%)
**Autenticación + Carrito:**
✅ **Backend Completo:** Spring Security JWT, Migraciones V2/V3,
   Entidades (User/Cart/Item), Repositories, Services (Auth/Cart @Transactional),
   Controllers (/api/auth, /api/cart protected), JwtAuthenticationFilter

✅ **BFF Completo:** Express + TypeScript
   - `auth.middleware.ts`: Verifica JWT en header Authorization, guarda userId/email/role en req.user
   - `cart.service.ts`: Proxy al backend inyectando userId del auth middleware
   - Rutas: POST /api/cart [PROTECTED] → autenticación obligatoria
   - CORS actualizado con credentials para soporte de cookies/sessions

✅ **Frontend Completo:** Angular 19 Standalone + Signals
   - `auth.interceptor.ts`: HTTP Interceptor funcional (Angular 17+) inyecta Bearer token en headers
   - `auth.guard.ts`: CanActivateFn verifica isAuthenticatedSignal() y redirige a /login si no autenticado
   - `auth.service.ts`: Signal-based state management:
     * Signals: userSignal<AuthUser>, isAuthenticatedSignal<boolean>, loadingSignal, errorSignal
     * Computed: isLoggedIn(), currentUser()
     * Métodos: login() (POST /api/auth/login), register() (201), logout() + localStorage sync
   - Routing: Rutas `/login`, `/register` públicas; `/cart` protegida con authGuard
   - Components:
     * `LoginComponent`: Reactive Forms (email/password), validaciones, @if/@for Signals
     * `RegisterComponent`: Formulario registro con bcrypt en backend
     * `CartComponent`: Componente protegido, muestra estado de autenticación
   - `app.component.ts`: Header dinámico con @if (isLoggedIn) mostrando menú auth/logout

## ✅ PROYECTO 3 COMPLETADO (100%) - Pedidos + Admin Panel
**Backend Completo:**
- **V4__orders.sql:** Tablas `orders`, `order_items` con triggers SQL automáticos de stock:
  * Trigger al crear orden: Reduce stock automáticamente en tabla products
  * Trigger al cancelar: Restaura stock eliminado
- **Entidades JPA:** `Order.java` (status enum, totalAmount), `OrderItem.java` (snapshot precio/cantidad)
- **Repositorios:** `OrderRepository.findByUserId()`, `findByIdAndUserId()` (seguridad por usuario)
- **Servicios:** 
  * `OrderService.processOrderFromCart(userId)`: @Transactional crea orden desde carrito actual
    - Valida stock disponible antes de crear
    - Crea Order + OrderItems con snapshot del precio al momento del pedido
    - Reduce stock vía trigger SQL automático
    - Vacía el carrito tras crear la orden exitosamente
  * `confirmOrder()`: Cambia status a CONFIRMED (stock ya reducido)
  * `cancelOrder()`: Cambia a CANCELLED y restaura stock automáticamente via trigger inverso
- **Controllers:**
  * POST `/api/orders?userId=X` - Procesar carrito → orden
  * GET `/api/orders?userId=X` - Listar órdenes del usuario
  * PATCH `/api/orders/{id}/confirmar` - Confirmar orden
  * PATCH `/api/orders/{id}/cancelar` - Cancelar y restaurar stock
- **Seguridad:** Roles ADMIN para /api/products/** (POST/PATCH), clientes solo ven sus órdenes propias

**BFF Completo:**
- `order.service.ts`: Service layer con Axios proxy completo al backend (processCart, listOrders, confirmOrder, cancelOrder)
- Rutas protegidas: `/api/orders/**` requieren autenticación JWT
- CORS configurado para frontend Angular + soporte de cookies

**Frontend Completo:**
- **Services:** `order.service.ts` Signal-based HTTP service con métodos: processCart(), listOrders(), confirmOrder(), cancelOrder()
- **Components:**
  * `CheckoutComponent`: Componente checkout que procesa carrito actual → orden (POST /api/orders)
    - Estado loading/error/success
    - Confirmación antes de procesar
    - Redirección a lista de órdenes tras crear
  * `OrdersListComponent`: Lista con **CDK Virtual Scroll** (`cdkVirtualScroll` + ItemSizeDispatcher)
    - Performance optimizada para listas largas (70vh height, 180px por item)
    - Visualización por status: PENDING (amarillo), CONFIRMED (verde), SHIPPED/DELIVERED/CANCELLED
    - Acciones: Confirmar orden, Cancelar orden con confirmación (stock se restaura automáticamente)
    - Filtro por estado y búsqueda
  * `OrderDetailComponent`: Detalle completo de orden mostrando tabla de items con precios snapshot
- **Admin Panel:** `admin-panel.component.ts` (solo role ADMIN):
  * Drag & Drop (**CdkDragDrop**) para reordenar productos visualmente
  * Export a CSV básico
  * Filtro por categoría
  * Gestión CRUD de productos

**Archivos Clave Creados:**
- Backend: `V4__orders.sql`, `Order.java`, `OrderItem.java`, repositorios, servicios, controllers + DTOs
- BFF: `order.service.ts` (proxy completo)
- Frontend: `order.service.ts`, `checkout.component.ts`, `orders-list.component.ts`, `admin-panel.component.ts`
- Infraestructura:
  * `docker-compose.yml`: Healthchecks para PostgreSQL, variables de entorno flexibles
  * `.env.example`: Plantilla de configuración (POSTGRES_USER, JWT_SECRET_KEY)
  * `.gitignore`: Exclusiones completas (node_modules, .env, target/, logs/)
  * `init-data.sql`: Datos seed iniciales (8 productos de ejemplo)
- Documentación: `README.md` completo con flujo de prueba y arquitectura

---

**Estado Actual:** 
✅ Proyecto 1: 100% - Catálogo CRUD paginado
✅ Proyecto 2: 100% - Autenticación JWT + Carrito
✅ Proyecto 3: 100% - Pedidos con triggers de stock + Admin Panel (CDK Drag/Drop)

**Próximo paso:** Testing automatizado (JUnit Backend, Jest/Supertest BFF, Angular TestBed + fakeAsync) o despliegue a producción.

**Para reanudar:**
1. `docker compose up --build -d` levanta todo el stack
2. Ver `/README.md` para URLs y comandos de prueba
3. Si se requiere Testing: ver sección "Testing" en README.md

Ver archivo: `ESTADO-GUARDADO.md` para detalles técnicos completos.