-- Event Service: V6 - Support event approval workflow (events start PENDING, admin approves/rejects)
ALTER TABLE events ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);
