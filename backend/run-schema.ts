import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSchema() {
  try {
    console.log('Connecting to database...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    console.log('Executing schema.sql...');
    await pool.query(schemaSql);
    console.log('Schema created successfully!');
    
  } catch (err) {
    console.error('Error creating schema:', err);
  } finally {
    await pool.end();
  }
}

runSchema();
