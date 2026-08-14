-- Event Service: V7 - Multi-session events (parent/child rows) + custom zone-based seat layouts
--
-- An "event" created via the new zone builder becomes a PARENT row (parent_event_id IS NULL,
-- no seats of its own) with one CHILD row per showtime/session (parent_event_id = parent.id,
-- each child has its own seats generated from the parent's zones). Legacy events created before
-- this migration have no children and keep working exactly as before (self-contained, own seats).

ALTER TABLE events ADD COLUMN IF NOT EXISTS parent_event_id BIGINT REFERENCES events(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_events_parent ON events(parent_event_id);

CREATE TABLE IF NOT EXISTS zones (
    id           BIGSERIAL PRIMARY KEY,
    event_id     BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    seat_type    VARCHAR(20) NOT NULL DEFAULT 'REGULAR',
    price        DECIMAL(12, 2) NOT NULL,
    row_count    INT NOT NULL,
    col_count    INT NOT NULL,
    row_spacing  DECIMAL(6, 2) NOT NULL DEFAULT 36,
    col_spacing  DECIMAL(6, 2) NOT NULL DEFAULT 32,
    curve_angle  DECIMAL(6, 2) NOT NULL DEFAULT 0,
    position_x   DECIMAL(8, 2) NOT NULL DEFAULT 0,
    position_y   DECIMAL(8, 2) NOT NULL DEFAULT 0,
    rotation     DECIMAL(6, 2) NOT NULL DEFAULT 0,
    color        VARCHAR(20),
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_zones_event ON zones(event_id);

-- Nullable: legacy seats (generated via the old straight-row seatSections form) have no zone/grid
-- position and keep rendering through the SeatMap's fallback (grouped by seat_row only).
ALTER TABLE seats ADD COLUMN IF NOT EXISTS zone_id BIGINT REFERENCES zones(id) ON DELETE CASCADE;
ALTER TABLE seats ADD COLUMN IF NOT EXISTS row_index INT;
ALTER TABLE seats ADD COLUMN IF NOT EXISTS col_index INT;
CREATE INDEX IF NOT EXISTS idx_seats_zone ON seats(zone_id);
