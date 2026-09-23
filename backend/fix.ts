const { pool } = require('./src/config/db');

async function run() {
  try {
    await pool.query("ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVO'");
    await pool.query("UPDATE personas SET sexo = 'FEMENINO' WHERE primer_nombre = 'Angie' OR primer_nombre = 'Carolina'");
    console.log('OK');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
