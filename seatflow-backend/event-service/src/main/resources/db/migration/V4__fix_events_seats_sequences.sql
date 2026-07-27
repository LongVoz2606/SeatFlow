-- Event Service: V4 - Fix sequences after V2 seed data used explicit IDs
-- BIGSERIAL sequences don't auto-advance when rows are inserted with an explicit id,
-- so the next Hibernate-generated insert collides with the seeded rows.

SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1));
SELECT setval('seats_id_seq', COALESCE((SELECT MAX(id) FROM seats), 1));
