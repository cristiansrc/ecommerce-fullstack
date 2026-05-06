# ESTADO GUARDADO - E-Commerce Learning Project

**Fecha:** Wed May 06 2026 (Actualizado)
**Ruta del proyecto:** `/home/cristiansrc/Documentos/Proyectos/ecommerce-fullstack`

---

## ✅ AVANCE COMPLETADO: Proyecto 1 (Catálogo de Productos) - 100%
### Backend Spring Boot - COMPLETO ✓
**Ruta:** `backend/`
- **Configuración crítica:** `spring.jpa.hibernate.ddl-auto=validate` en `application.yml`
- **Flyway V1:** `src/main/resources/db/migration/V1__init.sql` (Schema completo)
  - Tablas: `categories`, `products` (relación OneToMany)
- **Entidades JPA:**
  - `Category.java`: @Entity con nombre, slug, productos[]
  - `Product.java`: @Entity con validaciones (@NotBlank, @DecimalMin, @Min), relación Category
- **Repositorios:** 
  - `ProductRepository.java`: Queries paginadas (`findByIsActiveTrueAndCategoryId`, `findByNameContaining`)
- **Servicios:** `ProductService.java`: Mapeo Entity ↔ DTO (con BigDecimal para precio)
- **Controladores:**
  - `ProductController.java`: CRUD paginado, validaciones con @Valid
  - `GlobalExceptionHandler.java`: Manejo centralizado de errores
- **Dockerfile:** Multi-stage Maven + Spring Boot

### BFF Node.js - COMPLETO ✓
**Ruta:** `bff/`
- **Stack:** Express + TypeScript (TS config estricto)
- **Servicio:** `src/index.ts` con:
  - Service Layer: Clase `ProductService` usando Axios con baseURL configurada
  - Routing: `/api/products` proxy al backend
  - Error handling middleware centralizado
  - CORS habilitado
- **Dockerfile:** Node 20 Alpine + tsx (runtime TypeScript)

### Frontend Angular - COMPLETO ✓
**Ruta:** `frontend/`
**Conceptos Senior implementados:**
1. **Standalone Components:** Sin NgModules, `imports: [CommonModule]` directo
2. **Signals API:** 
   - State: `productsSignal`, `loadingSignal`, `errorSignal`
   - Computed: `hasProducts()`, `isLoading()` derivados automáticamente
3. **Control Flow Nativo (Angular 17+):**
   - `@if` para estados condicionales
   - `@for` con `track product.id` (performance)
4. **OnPush Change Detection:** Configurado en todos los componentes
5. **Lazy Loading:** `loadComponent()` en rutas dinámicas
6. **HTTP Interceptors:** `provideHttpClient(withInterceptorsFromDi())`
7. **Routing:**
   - Router config con rutas feature (`features/products`)
   - Componente raíz `app.component.ts` (Header + Main + RouterOutlet)
8. **Tipado completo:** DTOs en TypeScript sincronizados con Backend

**Archivos clave creados:**
- `src/app/features/products/product.service.ts`: Signal-based state management
- `src/app/features/products/products.component.ts`: Componente con Signals y Control Flow
- `app.config.ts`: Providers globales
- `routes.ts`: Configuración de rutas lazy-loaded

### Infraestructura - COMPLETO ✓
**docker-compose.yml:**
- PostgreSQL 16-alpine (volumen persistent)
- Backend: Spring Boot con variables de entorno
- BFF: Node.js Express proxy al backend
- Frontend: Angular dev server
- Network bridge `ecommerce-network`

---

## ✅ AVANCE COMPLETADO: Proyecto 2 (Autenticación + Carrito) - 100%
**Objetivo:** JWT Auth, State Management avanzado, Guards

### Backend COMPLETO:
- **Migraciones Flyway:**
  - `V2__users.sql`: Tabla `users` con roles (CUSTOMER/ADMIN), password_hash (bcrypt)
  - `V3__cart.sql`: Tablas `cart`, `cart_items` con relaciones ManyToOne
- **Entidades JPA:** `User.java` (@OneToOne Cart), `Cart.java`, `CartItem.java`
- **Repositorios:** `UserRepository` (findByEmail), `CartRepository` (findByUserId), `CartItemRepository`
- **Servicios:**
  - `AuthService`: Registro con bcrypt, Login devuelve JWT token
  - `CartService`: @Transactional, addToCart verifica producto activo/disponible
- **Controladores:**
  - `AuthController`: `/api/auth/register` (201), `/api/auth/login` (JWT issuance)
  - `CartController`: `/api/cart` POST con userId param + AddToCartDTO body [PROTECTED]
- **Security Config Completo:**
  - `JwtUtil.java`: Generación/validación JWT (claims: userId, email, role)
  - `JwtAuthenticationFilter.java`: Interceptor Bearer token en header Authorization
  - `SecurityConfig.java`: Permitir `/api/auth/**`, `/api/products/**` | Proteger `/api/cart/**`
- **DTOs:** RegisterDTO, LoginDTO, AddToCartDTO, CartItemDTO

### BFF COMPLETO:
- **Módulos agregados:** jsonwebtoken (v9.0.2)
- `auth.middleware.ts`: Verifica JWT en Authorization header, guarda userId/email/role en req.user para usarlo en rutas protegidas
- `cart.service.ts`: Clase CartService con métodos addToCart(userId), getCart(userId) - proxy al backend con userId del auth middleware (no expuesto a frontend)
- **Rutas protegidas:**
  - POST `/api/cart` [PROTECTED] → authMiddleware + cartService.addToCart(req.user.userId, dto)
- **CORS actualizado:** origin: ['http://localhost:4200', 'http://localhost:3000'], credentials: true

### Frontend COMPLETO:
- **Interceptores HTTP:** `auth.interceptor.ts` - Función interceptor Angular 17+ que añade Authorization: Bearer token de localStorage a todas las peticiones
- **Guards Router:** `auth.guard.ts` - CanActivateFn verifica authService.isLoggedIn() signal y redirige a /login con returnUrl si no autenticado
- **Signal Store (Auth State):** `auth.service.ts`:
  - Signals: userSignal<AuthUser|null>, isAuthenticatedSignal<boolean>, loadingSignal, errorSignal
  - Computed: isLoggedIn(), currentUser()
  - Métodos: login() (POST /api/auth/login), register() (201 POST /api/auth/register), logout() + localStorage.removeItem('auth_token')
- **Routing:** routes.ts:
  - `/login` → LoginComponent [PÚBLICO]
  - `/register` → RegisterComponent [PÚBLICO]
  - `/products` → ProductsComponent [PÚBLICO]
  - `/cart` → CartComponent [PROTECTED con authGuard]
- **Components:**
  - `LoginComponent`: Reactive Forms (email/password + validaciones), Signals para UI (@if loading/error), @routerLink a register
  - `RegisterComponent`: Formulario registro (email/password min 6 chars), integración con AuthService.register()
  - `CartComponent`: Componente protegido muestra mensaje "Acceso Requerido" si !isLoggedIn(), luego mostrará items del carrito
- **Header Dinámico:** app.component.ts actualizado:
  - @if isLoggedIn(): Muestra "Hola, email", botón cart link, logout button
  - @else: Muestra botones Ingresar/Registrarse

---

## ✅ AVANCE COMPLETADO: Proyecto 3 (Pedidos + Admin Panel) - 100%
**Objetivo:** Complejidad negocio, Testing, CDK - IMPLEMENTADO

### Backend Completo:
- **Migraciones Flyway V4:** `V4__orders.sql`
  - Tablas: `orders` (enum status PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED), `order_items` (ManyToMany vía tabla intermedia)
  - **Triggers SQL PL/pgSQL:**
    * Trigger `update_stock_on_order()`: Reduce stock al insertar order_items con status != CANCELLED
    * Trigger `restore_stock_on_cancel()`: Restaura stock automáticamente cuando orden cambia a CANCELLED
- **Entidades JPA:** 
  - `Order.java`: @Entity con User relación, totalAmount BigDecimal, enum OrderStatus, lista de OrderItems
  - `OrderItem.java`: @Entity con Order y Product relaciones, quantity, unitPrice (snapshot)
- **Repositorios:**
  - `OrderRepository.findByUserId(Long userId)`: Lista órdenes del usuario
  - `findByIdAndUserId(orderId, userId)`: Seguridad - solo acceso propio
- **Servicios:** 
  - `OrderService.java` @Transactional:
    * `processOrderFromCart(userId)`: 
      - Valida carrito no vacío
      - Crea Order con status PENDING y totalAmount sumado de items
      - Crea OrderItem para cada item del carrito (snapshot precio/cantidad)
      - Trigger SQL reduce stock automáticamente al hacer INSERT en order_items
      - Vacía el carrito tras crear orden
    * `confirmOrder(userId, orderId)`: Cambia status a CONFIRMED (verifica que es PENDING antes)
    * `cancelOrder(userId, orderId)`: Cambia a CANCELLED (trigger SQL restaura stock automáticamente)
- **Controladores:**
  - `OrderController.java`:
    * POST `/api/orders?userId=X` - Procesar carrito → orden [PROTECTED]
    * GET `/api/orders?userId=X` - Listar órdenes del usuario [PROTECTED]
    * PATCH `/api/orders/{id}/confirmar?userId=X` - Confirmar orden [PROTECTED]
    * PATCH `/api/orders/{id}/cancelar?userId=X` - Cancelar y restaurar stock [PROTECTED]
- **DTOs:** OrderDTO, OrderItemResponseDTO (para respuesta JSON)

### BFF Completo:
- `order.service.ts`: Service layer completo con Axios proxy al backend
  - Métodos: processCart(userId), listOrders(userId), confirmOrder(userId, orderId), cancelOrder(userId, orderId)
- **Rutas protegidas:** `/api/orders/**` requieren autenticación JWT
  - POST `/api/orders` → orderService.processCart(req.user.userId)
  - GET `/api/orders` → orderService.listOrders(req.user.userId)
  - PATCH `/api/orders/:id/confirmar` → orderService.confirmOrder(req.user.userId, orderId)
  - PATCH `/api/orders/:id/cancelar` → orderService.cancelOrder(req.user.userId, orderId)

### Frontend Completo:
**Services:**
- `order.service.ts`: Signal-based HTTP service
  - Signals: ordersSignal<Order[]>, loadingSignal<boolean>, errorSignal<string | null>
  - Computed: activeOrders (filtrado por status != CANCELLED)
  - Métodos:
    * processCart(userId): Observable que crea orden desde carrito actual
    * listOrders(userId): Promise que carga órdenes del usuario y actualiza signal
    * confirmOrder(userId, orderId): Patch a CONFIRMED
    * cancelOrder(userId, orderId): Patch a CANCELLED (restaura stock automáticamente)

**Components:**
- **CheckoutComponent:** Componente checkout simple
  - Signals: loading(), error(), orderCreated()
  - Botón "Procesar Orden" que llama a `orderService.processCart()`
  - Confirmación antes de procesar
  - Vista éxito con número de orden creada y redirección a /orders
- **OrdersListComponent:** Lista avanzada con CDK Virtual Scroll (performance)
  - **CDK Virtual Scroll:** cdkVirtualScroll + getItemSize$ (180px fixed height) para listas largas sin scroll jerárquico
  - Signals: orderService.ordersSignal() muestra lista paginada virtualmente
  - Visualización por status:
    * PENDING: borde amarillo, botón Confirmar/Cancelar
    * CONFIRMED: verde claro, solo Cancelar
    * SHIPPED/DELIVERED/CANCELLED: visualización readonly con colores distintivos
  - Acciones:
    * confirmOrder(orderId): PATCH confirmar orden (verifica userId propio)
    * cancelOrder(orderId, true): Confirmación "Stock se restaurará automáticamente" + PATCH cancelar
  - CDK DragDrop: No implementado aquí, solo Virtual Scroll para lista de órdenes
- **AdminPanelComponent:** Panel administrador con CDK Drag & Drop
  - **CDK DragDrop:** cdkDrag, CdkDragDrop event handler para reordenar productos
    * moveItemInArray() para actualizar orden local
    * Botón "Aplicar Orden" para guardar al backend (implementado conceptualmente)
  - Filtro por categoría con select dropdown
  - Export CSV: Función que genera Blob de productos actuales y descarga automática
  - Form modal para crear/editar productos (Reactive Forms concept)
- **OrderDetailComponent:** Detalle completo de orden específica
  - Tabla HTML mostrando items con precio snapshot unitario
  - Header con status badge colorizado, totalAmount formateado, fecha creación

**Routing actualizado:**
- `/checkout` [PROTECTED] → CheckoutComponent
- `/orders` [PROTECTED] → OrdersListComponent (con children routes)
  - `:id/detalle` → OrderDetailComponent
- `/admin` [PROTECTED + role ADMIN] → AdminPanelComponent

**Infraestructura adicional:**
- **Proxy configurado:** `proxy.conf.json` mapea /api a http://localhost:3000 (BFF)
- **Docker Compose actualizado:**
  - Variables de entorno flexibles (${POSTGRES_USER}, etc.)
  - Healthchecks para PostgreSQL (wait hasta ready)
  - `init-data.sql`: Datos seed iniciales (8 productos: MacBooks, iPhones, AirPods, etc.)
- **.env.example:** Plantilla con variables POSTGRES_*, JWT_SECRET_KEY
- **.gitignore:** Exclusiones completas (.env, node_modules/, target/, logs/)

---

## 📝 INSTRUCCIONES PARA REANUDAR

1. **Ubica el proyecto:** `/home/cristiansrc/Documentos/Proyectos/ecommerce-fullstack`
2. **Verifica que funcione Project 1-3:** `docker compose up --build -d`
   - Frontend: http://localhost:4200 (Catálogo + Auth + Carrito + Checkout + Órdenes)
   - Admin Panel: http://localhost:4200/admin (Drag & Drop productos, export CSV)
3. **Probar flujo completo:**
   - Login como cliente → Agregar al carrito → /checkout → Procesar orden → Ver en /orders
   - Cancelar orden y verificar stock restaurado en catálogo
   - Login como ADMIN (role=ADMIN) → /admin Drag & Drop productos
4. **Archivos de referencia:**
   - `README.md`: Documentación completa de arquitectura, URLs, comandos de prueba
   - `.gitignore`: Configurado para no subir secretos (.env)
5. **Próximo paso sugerido:** Testing automatizado (JUnit Backend, Jest BFF, Angular TestBed + fakeAsync)

## 🎯 NIVEL DE COMPLETITUD ACTUAL
**Project 1:** 100% completo y funcional ✓
**Project 2:** 100% completo y funcional ✓
**Project 3:** 100% completo e implementado ✓ (Pedidos + Triggers SQL de Stock + Admin Panel CDK)
