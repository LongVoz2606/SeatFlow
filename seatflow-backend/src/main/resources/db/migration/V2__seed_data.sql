-- Flyway Migration V2: Seed Data

-- Demo Users
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES 
('admin', 'admin@seatflow.com', '$2a$10$7Q.y5B8n9wJm9p3k5L6mue.Wq3R8f1v2o3t4u5v6w7x8y9z0a1b2c', 'System Admin', 'ADMIN'),
('john_doe', 'john@example.com', '$2a$10$7Q.y5B8n9wJm9p3k5L6mue.Wq3R8f1v2o3t4u5v6w7x8y9z0a1b2c', 'John Doe', 'CUSTOMER')
ON CONFLICT (username) DO NOTHING;

-- Demo Event 1: Concert
INSERT INTO events (id, title, description, location, event_date, banner_url, total_seats, available_seats, status)
VALUES (
    1,
    'Sơn Tùng M-TP Sky Tour 2026',
    'Đêm nhạc âm nhạc đỉnh cao quy tụ hàng ngàn khán giả tại SVĐ Mỹ Đình.',
    'Sân vận động Quốc gia Mỹ Đình, Hà Nội',
    NOW() + INTERVAL '30 days',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    30,
    30,
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- Demo Event 2: Tech Conference
INSERT INTO events (id, title, description, location, event_date, banner_url, total_seats, available_seats, status)
VALUES (
    2,
    'Vietnam Tech Summit 2026',
    'Hội thảo Công nghệ Hàng đầu Việt Nam hội tụ các Chuyên gia AI & Distributed Systems.',
    'Trung tâm Hội nghị Quốc gia, Hà Nội',
    NOW() + INTERVAL '45 days',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    20,
    20,
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- Seed Seats for Event 1 (Row A, B, C x 10 seats)
INSERT INTO seats (event_id, seat_number, seat_row, seat_type, price, status, version)
SELECT 
    1, 
    seat_row || seat_num, 
    seat_row, 
    CASE WHEN seat_row = 'A' THEN 'VIP' ELSE 'REGULAR' END,
    CASE WHEN seat_row = 'A' THEN 1500000.00 ELSE 800000.00 END,
    'AVAILABLE',
    0
FROM 
    (VALUES ('A'), ('B'), ('C')) AS r(seat_row),
    generate_series(1, 10) AS seat_num
ON CONFLICT (event_id, seat_number) DO NOTHING;

-- Seed Seats for Event 2 (Row A, B x 10 seats)
INSERT INTO seats (event_id, seat_number, seat_row, seat_type, price, status, version)
SELECT 
    2, 
    seat_row || seat_num, 
    seat_row, 
    CASE WHEN seat_row = 'A' THEN 'VIP' ELSE 'REGULAR' END,
    CASE WHEN seat_row = 'A' THEN 2000000.00 ELSE 1200000.00 END,
    'AVAILABLE',
    0
FROM 
    (VALUES ('A'), ('B')) AS r(seat_row),
    generate_series(1, 10) AS seat_num
ON CONFLICT (event_id, seat_number) DO NOTHING;
