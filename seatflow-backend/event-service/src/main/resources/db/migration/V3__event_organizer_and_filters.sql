-- Event Service: V3 - Organizers + Event filter fields (hot, price range)

CREATE TABLE IF NOT EXISTS organizers (
    id                BIGSERIAL PRIMARY KEY,
    auth_user_id      BIGINT NOT NULL UNIQUE,
    organization_name VARCHAR(255) NOT NULL,
    description       TEXT,
    contact_email     VARCHAR(100) NOT NULL,
    contact_phone     VARCHAR(20),
    logo_url          VARCHAR(500),
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason  VARCHAR(500),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_organizers_auth_user ON organizers(auth_user_id);

ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_id BIGINT REFERENCES organizers(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_hot BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS min_price DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_price DECIMAL(12, 2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_hot       ON events(is_hot);

-- Backfill min/max price cho các event đã seed từ V2 (dựa vào giá ghế thực tế)
UPDATE events e SET
  min_price = COALESCE((SELECT MIN(price) FROM seats WHERE event_id = e.id), 0),
  max_price = COALESCE((SELECT MAX(price) FROM seats WHERE event_id = e.id), 0);
