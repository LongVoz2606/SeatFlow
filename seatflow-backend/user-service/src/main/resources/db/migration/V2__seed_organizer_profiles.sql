-- User Service: V2 - Seed Organizer Profiles

INSERT INTO user_profiles (user_id, username, email, full_name) VALUES
(10, 'music_group', 'music@seatflow.com', 'Music Production Group'),
(11, 'tech_summit_org', 'tech@seatflow.com', 'Vietnam Tech Events'),
(12, 'art_stage', 'art@seatflow.com', 'Arts & Stage Theater'),
(13, 'sports_agency', 'sports@seatflow.com', 'National Sports Agency'),
(14, 'fest_inc', 'festivals@seatflow.com', 'Entertainment & Festival Inc.')
ON CONFLICT (user_id) DO NOTHING;
