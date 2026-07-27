-- Auth Service: V1 - Initial Schema
-- Table: auth_users

CREATE TABLE IF NOT EXISTS auth_users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users(username);
CREATE INDEX IF NOT EXISTS idx_auth_users_email    ON auth_users(email);

-- Seed: default admin (password: Admin@123)
INSERT INTO auth_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@seatflow.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Admin',
    'ADMIN'
) ON CONFLICT DO NOTHING;

-- Seed: demo user (password: User@123)
INSERT INTO auth_users (username, email, password_hash, full_name, role)
VALUES (
    'johndoe',
    'john@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'John Doe',
    'USER'
) ON CONFLICT DO NOTHING;
