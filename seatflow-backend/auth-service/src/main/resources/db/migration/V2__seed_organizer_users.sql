-- Auth Service: V2 - Seed Organizer Users

INSERT INTO auth_users (id, username, email, password_hash, full_name, role) VALUES
(10, 'music_group', 'music@seatflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Music Production Group', 'USER'),
(11, 'tech_summit_org', 'tech@seatflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vietnam Tech Events', 'USER'),
(12, 'art_stage', 'art@seatflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Arts & Stage Theater', 'USER'),
(13, 'sports_agency', 'sports@seatflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'National Sports Agency', 'USER'),
(14, 'fest_inc', 'festivals@seatflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Entertainment & Festival Inc.', 'USER')
ON CONFLICT (id) DO NOTHING;

SELECT setval('auth_users_id_seq', COALESCE((SELECT MAX(id) FROM auth_users), 1));
