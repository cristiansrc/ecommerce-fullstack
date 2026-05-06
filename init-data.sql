-- Init Data: Productos iniciales para testing
-- Ejecutado automáticamente al primer arranque de PostgreSQL

-- Laptops (categoría ID=1)
INSERT INTO products (name, description, price, stock, category_id, is_active, created_at) VALUES
('MacBook Pro M3', '14 pulgadas, chip M3, 8GB RAM, 256GB SSD', 1499.00, 15, 1, true, now()),
('Dell XPS 13 Plus', 'Intel Core i7-1360P, 16GB RAM, 512GB SSD', 1299.00, 8, 1, true, now()),
('HP Spectre x360', 'Intel Core i5-1340P, 16GB RAM, 512GB SSD, convertible', 999.00, 12, 1, true, now());

-- Smartphones (categoría ID=2)
INSERT INTO products (name, description, price, stock, category_id, is_active, created_at) VALUES
('iPhone 15 Pro', 'Titanium, A17 Pro chip, 256GB', 999.00, 20, 2, true, now()),
('Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3, 512GB, S Pen', 1199.00, 18, 2, true, now()),
('Google Pixel 8 Pro', 'Tensor G3, 12GB RAM, 256GB, AI camera', 899.00, 7, 2, true, now());

-- Periféricos (categoría ID=3)
INSERT INTO products (name, description, price, stock, category_id, is_active, created_at) VALUES
('AirPods Pro 2nd Gen', 'Cancelación activa de ruido, USB-C case', 249.00, 50, 3, true, now()),
('Logitech MX Master 3S', 'Wireless mouse, 8K DPI, Ergonomic', 99.00, 35, 3, true, now());
