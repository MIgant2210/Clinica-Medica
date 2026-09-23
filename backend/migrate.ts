import { pool } from './src/config/db';

async function runMigration() {
  try {
    console.log('Iniciando migración de base de datos...');

    // 1. Citas
    console.log('Modificando tabla citas...');
    await pool!.query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS modalidad VARCHAR(50) DEFAULT 'PRESENCIAL'`);
    await pool!.query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS enlace_telemedicina VARCHAR(255)`);

    // 2. Expedientes
    console.log('Modificando tabla expedientes...');
    await pool!.query(`ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS antecedentes_obstetricos JSONB DEFAULT '{}'::jsonb`);
    await pool!.query(`ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS antecedentes_pediatricos JSONB DEFAULT '{}'::jsonb`);
    await pool!.query(`ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS vacunas JSONB DEFAULT '[]'::jsonb`);

    // 3. Consultas
    console.log('Modificando tabla consultas...');
    await pool!.query(`ALTER TABLE consultas ADD COLUMN IF NOT EXISTS tipo_consulta VARCHAR(50) DEFAULT 'GENERAL'`);
    await pool!.query(`ALTER TABLE consultas ADD COLUMN IF NOT EXISTS modalidad VARCHAR(50) DEFAULT 'PRESENCIAL'`);
    await pool!.query(`ALTER TABLE consultas ADD COLUMN IF NOT EXISTS datos_obstetricos JSONB DEFAULT '{}'::jsonb`);
    await pool!.query(`ALTER TABLE consultas ADD COLUMN IF NOT EXISTS datos_pediatricos JSONB DEFAULT '{}'::jsonb`);
    await pool!.query(`ALTER TABLE consultas ADD COLUMN IF NOT EXISTS datos_remotos JSONB DEFAULT '{}'::jsonb`);

    console.log('Migración completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    process.exit();
  }
}

runMigration();
