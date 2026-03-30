ALTER TABLE foods
  ADD COLUMN is_custom   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN created_by  INTEGER REFERENCES users(id) ON DELETE CASCADE;

  CREATE INDEX idx_foods_created_by ON foods(created_by);