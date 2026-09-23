import { pool } from './src/config/db';
async function run() {
  try {
    const res = await pool!.query(`SELECT p.id, per.primer_nombre, per.sexo FROM pacientes p JOIN personas per ON p.persona_id = per.id`);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
