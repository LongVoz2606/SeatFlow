-- User Service: V1 - Initial Schema
CREATE TABLE IF NOT EXISTS user_profiles (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,  -- References auth_users.id
    username    VARCHAR(50) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    full_name   VARCHAR(100),
    phone       VARCHAR(20),
    avatar_url  VARCHAR(500),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
