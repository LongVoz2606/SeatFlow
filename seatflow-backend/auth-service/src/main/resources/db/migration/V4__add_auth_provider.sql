-- Auth Service: V4 - Track how the account was created (LOCAL / GOOGLE / FACEBOOK)
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';
