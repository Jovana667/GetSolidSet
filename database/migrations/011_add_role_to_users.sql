ALTER TABLE users
ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'client'
CHECK (role IN ('trainer', 'client'));