import { pool } from './src/config/db';
async function run() {
  try {
    await pool!.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVO'`);
    await pool!.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log("Columnas agregadas");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
