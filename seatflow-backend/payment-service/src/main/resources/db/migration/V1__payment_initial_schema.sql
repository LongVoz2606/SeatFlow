-- Payment Service: V1 - Initial Schema
CREATE TABLE IF NOT EXISTS payments (
    id              BIGSERIAL PRIMARY KEY,
    booking_code    VARCHAR(36)  NOT NULL UNIQUE,
    user_id         BIGINT       NOT NULL,
    amount          DECIMAL(12, 2) NOT NULL,
    method          VARCHAR(50)  NOT NULL DEFAULT 'MOCK',
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    transaction_id  VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_code);
CREATE INDEX IF NOT EXISTS idx_payments_status  ON payments(status);
