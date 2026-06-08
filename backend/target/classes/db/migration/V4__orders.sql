-- Project 3: Pedidos/Orders
-- V4 para migraciones Flyway

CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status order_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order Items (snapshot de productos al momento del pedido)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Trigger para actualizar stock de productos cuando se crean orders con status no CANCELLED
CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('PENDING', 'CONFIRMED', 'SHIPPED') THEN
        UPDATE products 
        SET stock = stock - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_order_insert
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_order();

-- Trigger para restaurar stock cuando se cancela pedido (opcional, para lógica de negocio)
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'CANCELLED' AND NEW.status = 'CANCELLED' THEN
        -- Restaurar stock de todos los items del pedido cancelado
        UPDATE products p
        SET stock = stock + oi.quantity
        FROM order_items oi
        WHERE oi.product_id = p.id AND oi.order_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restore_stock_on_cancel
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_cancel();
