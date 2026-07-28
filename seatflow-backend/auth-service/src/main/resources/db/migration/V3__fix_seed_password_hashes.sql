-- Auth Service: V3 - Fix seed password hashes
-- V1/V2 seeded every account with the same placeholder bcrypt hash, which does
-- NOT actually correspond to the documented passwords. Replace with real hashes.

-- admin / Admin@123
UPDATE auth_users SET password_hash = '$2b$10$0nMT2XmrjGhJU9k20l5Wl.s8eHzQJvWAS0uVUwdh7dYaO/BhZa/0O'
WHERE username = 'admin';

-- johndoe / User@123
UPDATE auth_users SET password_hash = '$2b$10$v/cf1t5H.Q..Z/duzKZgCOeqSxVJ79sEFIjh0ZSeRUX7By/LZFK8.'
WHERE username = 'johndoe';

-- organizer demo accounts / Org@123
UPDATE auth_users SET password_hash = '$2b$10$IM9Fn.0.HqYUdLDMLB52.OTnrdW9gCR8mh0u.m6t2LtfS027D2GOy'
WHERE username IN ('music_group', 'tech_summit_org', 'art_stage', 'sports_agency', 'fest_inc');
