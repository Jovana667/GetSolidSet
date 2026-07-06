DO $$
BEGIN
    -- Only attempt the rename if the old table exists AND the new table name is completely free
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'skin_fold') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'skin_folds') THEN
        
        ALTER TABLE skin_fold RENAME TO skin_folds;
        
    END IF;
END $$;