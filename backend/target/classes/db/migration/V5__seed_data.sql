-- Seed Data: Productos iniciales para testing
-- Insertar después de crear las tablas (V1__init.sql ya crea categorías)

-- Cargar productos en la categoría 'Laptops' (ID=1 si existe, sino 2)
INSERT INTO products (name, description, price, stock, category_id, is_active, created_at) VALUES
('MacBook Pro M3', '14 pulgadas, chip M3, 8GB RAM, 256GB SSD', 1499.00, 15, (SELECT id FROM categories WHERE slug='laptops' LIMIT 1), TRUE, NOW()),
('Dell XPS 13 Plus', 'Intel Core i7-1360P, 16GB RAM, 512GB SSD', 1299.00, 8, (SELECT id FROM categories WHERE slug='laptops' LIMIT 1), TRUE, NOW()),
('HP Spectre x360', 'Intel Core i5-1340P, 16GB RAM, 512GB SSD, convertible', 999.00, 12, (SELECT id FROM categories WHERE slug='laptops' LIMIT 1), TRUE, NOW()),
('Lenovo ThinkPad X1 Carbon', 'Intel Core i7-1370P, 16GB RAM, 1TB SSD', 1599.00, 5, (SELECT id FROM categories WHERE slug='laptops' LIMIT 1), TRUE, NOW()),
('ASUS ROG Zephyrus G14', 'AMD Ryzen 9 7940HS, RTX 4060, 32GB RAM', 1899.00, 3, (SELECT id FROM categories WHERE slug='laptops' LIMIT 1), TRUE, NOW());

-- Smartphones (categoría ID=2)
INSERT INTO products (name, description, price, stock, category_id, is_active, created_at) VALUES
('iPhone 15 Pro', 'Titanium, A17 Pro chip, 256GB', 999.00, 20, (SELECT id FROM categories WHERE slug='smartphones' LIMIT 1), TRUE, NOW()),
('Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3, 512GB, S Pen', 1199.00, 18, (SELECT id FROM categories WHERE slug='smartphones' LIMIT 1), TRUE, NOW()),
('Google Pixel 8 Pro', 'Tensor G3, 12GB RAM, 256GB, AI camera', 899.00, 7, (SELECT id FROM categories WHERE slug='smartphones' LIMIT 1), TRUE, NOW());

-- Periféricos (categoría ID=3)
INSERT INTO products (name, description, price, stock, category_id, is_active, created_at) VALUES
('AirPods Pro 2nd Gen', 'Cancelación activa de ruido, USB-C charging case', 249.00, 50, (SELECT id FROM categories WHERE slug='perifericos' LIMIT 1), TRUE, NOW()),
('Logitech MX Master 3S', 'Wireless mouse, 8K DPI, Ergonomic', 99.00, 35, (SELECT id FROM categories WHERE slug='perifericos' LIMIT 1), TRUE, NOW());
