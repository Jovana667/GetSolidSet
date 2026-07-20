-- Removes the old blanket unique constraint on foods.name.
-- Superseded by foods_name_active_idx, a partial unique index scoped to
-- (name, created_by) WHERE is_active = true — this allows different users
-- to reuse the same food name, and allows a single user to reuse a name
-- after their previous custom food with that name was soft-deleted.
ALTER TABLE foods DROP CONSTRAINT IF EXISTS foods_name_key;