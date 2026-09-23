import { pool } from './src/config/db';
async function run() {
  try {
    const tables = ['personas', 'pacientes', 'citas', 'expedientes', 'consultas'];
    for (const t of tables) {
      const {rows} = await pool!.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [t]);
      console.log('Table:', t);
      console.log(rows);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
