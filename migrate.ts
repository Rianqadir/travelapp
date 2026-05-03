import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('Migrating DB...');
  await sql(`
    ALTER TABLE cars ADD COLUMN IF NOT EXISTS city_mileage REAL;
    ALTER TABLE cars ADD COLUMN IF NOT EXISTS highway_mileage REAL;
    ALTER TABLE cars DROP COLUMN IF EXISTS custom_mileage;
  `);
  console.log('Migration complete.');
}

migrate().catch(console.error);
