import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.oetkzzayhnowscfnirym:Umg%24supabase123456@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful:', res.rows[0]);
  } catch (err) {
    console.error('Error connecting:', err);
  } finally {
    await pool.end();
  }
}

test();
