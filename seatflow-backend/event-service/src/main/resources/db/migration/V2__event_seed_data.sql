-- Event Service: V2 - Seed Data

INSERT INTO events (id, title, description, location, event_date, banner_url, total_seats, available_seats, status) VALUES (
    1,
    'Sơn Tùng M-TP Sky Tour 2026',
    'Đêm nhạc âm nhạc đỉnh cao quy tụ hàng ngàn khán giả tại SVĐ Mỹ Đình.',
    'Sân vận động Quốc gia Mỹ Đình, Hà Nội',
    '2026-08-27 19:30:00+07',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    30, 30, 'ACTIVE'
) ON CONFLICT DO NOTHING;

INSERT INTO events (id, title, description, location, event_date, banner_url, total_seats, available_seats, status) VALUES (
    2,
    'Vietnam Tech Summit 2026',
    'Hội thảo Công nghệ Hàng đầu Việt Nam hội tụ các Chuyên gia AI & Distributed Systems.',
    'Trung tâm Hội nghị Quốc gia, Hà Nội',
    '2026-09-15 08:30:00+07',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    20, 20, 'ACTIVE'
) ON CONFLICT DO NOTHING;

-- Seats for Event 1
INSERT INTO seats (event_id, seat_number, seat_row, seat_type, price, status, version) VALUES
(1,'A1','A','VIP',1500000.00,'AVAILABLE',0),(1,'A2','A','VIP',1500000.00,'AVAILABLE',0),
(1,'A3','A','VIP',1500000.00,'AVAILABLE',0),(1,'A4','A','VIP',1500000.00,'AVAILABLE',0),
(1,'A5','A','VIP',1500000.00,'AVAILABLE',0),(1,'A6','A','VIP',1500000.00,'AVAILABLE',0),
(1,'A7','A','VIP',1500000.00,'AVAILABLE',0),(1,'A8','A','VIP',1500000.00,'AVAILABLE',0),
(1,'A9','A','VIP',1500000.00,'AVAILABLE',0),(1,'A10','A','VIP',1500000.00,'AVAILABLE',0),
(1,'B1','B','REGULAR',800000.00,'AVAILABLE',0),(1,'B2','B','REGULAR',800000.00,'AVAILABLE',0),
(1,'B3','B','REGULAR',800000.00,'AVAILABLE',0),(1,'B4','B','REGULAR',800000.00,'AVAILABLE',0),
(1,'B5','B','REGULAR',800000.00,'AVAILABLE',0),(1,'B6','B','REGULAR',800000.00,'AVAILABLE',0),
(1,'B7','B','REGULAR',800000.00,'AVAILABLE',0),(1,'B8','B','REGULAR',800000.00,'AVAILABLE',0),
(1,'B9','B','REGULAR',800000.00,'AVAILABLE',0),(1,'B10','B','REGULAR',800000.00,'AVAILABLE',0),
(1,'C1','C','REGULAR',800000.00,'AVAILABLE',0),(1,'C2','C','REGULAR',800000.00,'AVAILABLE',0),
(1,'C3','C','REGULAR',800000.00,'AVAILABLE',0),(1,'C4','C','REGULAR',800000.00,'AVAILABLE',0),
(1,'C5','C','REGULAR',800000.00,'AVAILABLE',0),(1,'C6','C','REGULAR',800000.00,'AVAILABLE',0),
(1,'C7','C','REGULAR',800000.00,'AVAILABLE',0),(1,'C8','C','REGULAR',800000.00,'AVAILABLE',0),
(1,'C9','C','REGULAR',800000.00,'AVAILABLE',0),(1,'C10','C','REGULAR',800000.00,'AVAILABLE',0)
ON CONFLICT DO NOTHING;

-- Seats for Event 2
INSERT INTO seats (event_id, seat_number, seat_row, seat_type, price, status, version) VALUES
(2,'A1','A','VIP',2000000.00,'AVAILABLE',0),(2,'A2','A','VIP',2000000.00,'AVAILABLE',0),
(2,'A3','A','VIP',2000000.00,'AVAILABLE',0),(2,'A4','A','VIP',2000000.00,'AVAILABLE',0),
(2,'A5','A','VIP',2000000.00,'AVAILABLE',0),(2,'A6','A','VIP',2000000.00,'AVAILABLE',0),
(2,'A7','A','VIP',2000000.00,'AVAILABLE',0),(2,'A8','A','VIP',2000000.00,'AVAILABLE',0),
(2,'A9','A','VIP',2000000.00,'AVAILABLE',0),(2,'A10','A','VIP',2000000.00,'AVAILABLE',0),
(2,'B1','B','REGULAR',1200000.00,'AVAILABLE',0),(2,'B2','B','REGULAR',1200000.00,'AVAILABLE',0),
(2,'B3','B','REGULAR',1200000.00,'AVAILABLE',0),(2,'B4','B','REGULAR',1200000.00,'AVAILABLE',0),
(2,'B5','B','REGULAR',1200000.00,'AVAILABLE',0),(2,'B6','B','REGULAR',1200000.00,'AVAILABLE',0),
(2,'B7','B','REGULAR',1200000.00,'AVAILABLE',0),(2,'B8','B','REGULAR',1200000.00,'AVAILABLE',0),
(2,'B9','B','REGULAR',1200000.00,'AVAILABLE',0),(2,'B10','B','REGULAR',1200000.00,'AVAILABLE',0)
ON CONFLICT DO NOTHING;
