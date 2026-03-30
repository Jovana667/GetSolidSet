ALTER TABLE foods DROP CONSTRAINT foods_name_unique;

ALTER TABLE foods ADD CONSTRAINT foods_name_unique 
  UNIQUE NULLS NOT DISTINCT (name, created_by);