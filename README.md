# E-Commerce Learning Project

## 📦 Proyectos Completados

### ✅ Proyecto 1: Catálogo de Productos (CRUD)
- **Backend:** Spring Boot + PostgreSQL + Flyway V1 (`ddl-auto=validate`)
- **BFF:** Node.js/Express proxy con TypeScript  
- **Frontend:** Angular 19 Standalone + Signals (@if/@for, OnPush, loadComponent)

### ✅ Proyecto 2: Autenticación + Carrito
- **Backend:** Spring Security JWT, Migraciones V2/V3, Auth/Cart Services
- **BFF:** Express con middleware JWT verification y proxy al backend
- **Frontend:** Signals (Auth state), HTTP Interceptor (Bearer token), Router Guards (`CanActivateFn`)

### ✅ Proyecto 3: Pedidos + Admin Panel (Completo)
#### Backend
- **Migración V4:** Tablas `orders`/`order_items`, triggers SQL automáticos de stock
- **Entidades:** Order + OrderItem (snapshot precio/cantidad al momento del pedido)
- **Servicios:** 
  - `OrderService.processOrderFromCart()`: Transaccional, reduce stock vía trigger SQL
  - Cancelación restaura stock automáticamente (trigger SQL inverso)
- **API:** `/api/orders` (listar), `/api/orders?userId=X`, confirmar/cancelar pedidos

#### BFF
- **Services:** `order.service.ts` proxy completo al backend
- **Rutas protegidas:** `/api/orders/**` con autenticación JWT obligatorio

#### Frontend Angular 19
- **Services:** Signal-based HTTP service para órdenes
- **CheckoutComponent:** Flujo checkout carrito → orden (POST /api/orders)
- **OrdersListComponent:** 
  - CDK Virtual Scroll (`cdkVirtualScroll`) para performance optimizada en listas largas
  - Estado visual por status: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  - Acciones: Confirmar/Cancelar con restauración automática de stock
- **AdminPanelComponent:** 
  - Drag & Drop (`CdkDragDrop`) para reordenar productos
  - Export CSV básico
  - Filtro por categoría
- **OrderDetailComponent:** Detalle completo de orden con tabla de items

---

## 🚀 Configuración y Ejecución

### Prerrequisitos
- Docker & Docker Compose v3.8+
- PostgreSQL 16 (incluirá en docker)
- Node.js 20+ (opcional para desarrollo local sin docker)

### Pasos Iniciales

```bash
# 1. Clonar/entrar al proyecto
cd /home/cristiansrc/Documentos/Proyectos/ecommerce-fullstack/

# 2. Crear archivo .env (opcional, usar defaults o personalizar)
cp .env.example .env

# 3. Levantar todo el stack con Docker Compose
docker compose up --build -d
```

### URLs de Acceso
- **Frontend:** http://localhost:4200/
- **BFF (API Gateway):** http://localhost:3000/api/products, /api/orders, etc.
- **Backend directo:** http://localhost:8080/api/products
- **PostgreSQL:** localhost:5432/ecommerce_db (usuario: ecommerce)

### Comandos Docker Útiles
```bash
# Ver logs de un servicio específico
docker compose logs backend
docker compose logs bff
docker compose logs frontend

# Acceder a PostgreSQL desde host
psql -h localhost -U ecom_user -d ecommerce_db

# Reingresar al contenedor backend (para debugging)
docker exec -it ecommerce-backend sh
```

---

## 🛠️ Probar Proyecto 3: Pedidos + Admin Panel

### Flujo de Prueba

#### 1. Autenticación
```bash
# Crear usuario admin (role ADMIN)
POST http://localhost:3000/api/auth/register
Content-Type: application/json
{
  "email": "admin@test.com",
  "password": "admin123"
}

# Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

#### 2. Carrito → Orden (Checkout)
```bash
# Agregar al carrito (requiere token Bearer)
POST http://localhost:3000/api/cart?userId=1
Content-Type: application/json
Authorization: Bearer <token>
{
  "productId": 1,
  "quantity": 2
}

# Procesar orden desde carrito
POST http://localhost:3000/api/orders?userId=1
Authorization: Bearer <token>
```

#### 3. Admin Panel (Solo role ADMIN)
```bash
GET http://localhost:3000/api/products?page=0&size=20

# Verificar stock se redujo al crear orden
GET http://localhost:8080/api/products/1
```

#### 4. Cancelación y Restauración de Stock
```bash
# Confirmar orden (status → CONFIRMED)
PATCH http://localhost:3000/api/orders/{orderId}/confirmar?userId=1
Authorization: Bearer <token>

# Cancelar orden (stock restaurado automáticamente por trigger SQL)
PATCH http://localhost:3000/api/orders/{orderId}/cancelar?userId=1
Authorization: Bearer <token>
```

---

## 📁 Estructura del Proyecto

```
ecommerce-fullstack/
├── backend/                    # Spring Boot + PostgreSQL + JWT
│   ├── src/main/java/com/ecommerce/
│   │   ├── controller/         # REST endpoints (Auth, Products, Cart, Orders)
│   │   ├── entity/             # JPA Entities (User, Product, Order, etc.)
│   │   ├── service/            # Business logic @Transactional
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   └── security/           # JWT filter & config
│   └── src/main/resources/db/migration/
│       ├── V1__init.sql        # Tablas base
│       ├── V2__users.sql       # Auth tables
│       ├── V3__cart.sql        # Carrito tables
│       ├── V4__orders.sql      # Pedidos + triggers SQL de stock
│       └── V5__seed_data.sql   # Datos de prueba (opcional)
├── bff/                        # Node.js/Express Gateway
│   └── src/
│       ├── services/           # Axios proxies a backend
│       └── middleware/auth.middleware.ts  # JWT verification
├── frontend/                   # Angular 19 Standalone + Signals
│   └── src/app/features/
│       ├── auth/               # Login/Register components
│       ├── products/           # Catálogo con Signals
│       ├── cart/               # Carrito component (Project 2)
│       ├── orders/             # Checkout, Orders List (CDK Virtual Scroll)
│       └── admin/              # Admin Panel (CDK Drag & Drop)
├── docker-compose.yml          # Orquestación completa
└── .env                        # Variables de entorno
```

---

## 🎯 Conceptos Senior Implementados (Project 3)

| Feature | Backend | BFF | Frontend |
|---------|---------|-----|----------|
| **Transaccionalidad** | `@Transactional` en OrderService | - | - |
| **SQL Triggers** | Automática reducción/restauración de stock vía triggers PL/pgSQL | - | - |
| **Snapshot Pricing** | OrderItem guarda precio al momento del pedido (unitPrice) | Proxy directo | Visualización tabla items |
| **Performance UI** | Paginación JPA | Service layer caching | CDK Virtual Scroll (cdkVirtualScrollGetItemSize) |
| **Drag & Drop** | - | - | CDK DragDrop para reordenar productos admin |

---

## 🔒 Seguridad
- JWT Token en header `Authorization: Bearer <token>`
- Roles: `CUSTOMER` (cliente estándar), `ADMIN` (acceso completo backend)
- Clientes solo ven/editan sus órdenes propias (`findByUserId`, `findByIdAndUserId`)

---

## 📝 Notas de Desarrollo

**Importante:**
1. No cambiar `spring.jpa.hibernate.ddl-auto=validate` en producción (usa Flyway para migraciones)
2. Los triggers SQL V4 manejan automáticamente el stock; no modificar manualmente sin considerar lógica inversa
3. CDK Virtual Scroll requiere altura fija (`height: 70vh`) para funcionar correctamente
