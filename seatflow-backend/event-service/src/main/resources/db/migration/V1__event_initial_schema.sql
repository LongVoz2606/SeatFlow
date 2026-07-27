-- Event Service: V1 - Initial Schema
-- Tables: events, seats

CREATE TABLE IF NOT EXISTS events (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    location        VARCHAR(255) NOT NULL,
    event_date      TIMESTAMP WITH TIME ZONE NOT NULL,
    banner_url      VARCHAR(500),
    total_seats     INT NOT NULL DEFAULT 0,
    available_seats INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seats (
    id              BIGSERIAL PRIMARY KEY,
    event_id        BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    seat_number     VARCHAR(20) NOT NULL,
    seat_row        VARCHAR(10) NOT NULL,
    seat_type       VARCHAR(20) NOT NULL DEFAULT 'REGULAR',
    price           DECIMAL(12, 2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    version         BIGINT NOT NULL DEFAULT 0,
    held_until      TIMESTAMP WITH TIME ZONE,
    held_by_user_id BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_event_seat UNIQUE(event_id, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seats_event_status ON seats(event_id, status);
CREATE INDEX IF NOT EXISTS idx_seats_held_until   ON seats(held_until, status);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, event_date);
