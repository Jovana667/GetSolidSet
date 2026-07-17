const { Pool } = require('pg');
const fs = require('fs'); 
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../services/auth-service/.env') });

// Smart check: Does our active database string contain 'localhost' or '127.0.0.1'?
const isLocalhost = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // DYNAMIC SSL: Turn it completely OFF for local, turn it ON for cloud deployment
  ssl: isLocalhost ? false : { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('🚀 Starting migrations...\n');

    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    // Run each migration
    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      // Check if already run
      const { rows } = await pool.query(
        'SELECT * FROM migrations WHERE name = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already run)`);
        continue;
      }

      // Read and execute migration
      console.log(`▶️  Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);

      // Mark as complete
      await pool.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [file]
      );
      console.log(`✅ Completed ${file}\n`);
    }

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();