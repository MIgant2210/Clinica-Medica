import { Pool } from 'pg';
import dotenv from 'dotenv';
import { inMemoryStore } from './src/config/db';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    console.log('Iniciando volcado de datos (seed)...');

    // 1. Sedes
    for (const s of inMemoryStore.sedes) {
      await pool.query(
        `INSERT INTO sedes (id, codigo, nombre, direccion, telefono) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.codigo, s.nombre, s.direccion, s.telefono]
      );
    }
    console.log('Sedes insertadas');

    // 2. Areas
    for (const a of inMemoryStore.areas) {
      await pool.query(
        `INSERT INTO areas (id, sede_id, codigo, nombre, piso_ubicacion) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [a.id, a.sede_id, a.codigo, a.nombre, a.piso_ubicacion]
      );
    }

    // 3. Especialidades
    for (const e of inMemoryStore.especialidades) {
      await pool.query(
        `INSERT INTO especialidades (id, codigo, nombre, descripcion) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [e.id, e.codigo, e.nombre, e.descripcion]
      );
    }

    // 4. Servicios
    for (const s of inMemoryStore.servicios) {
      await pool.query(
        `INSERT INTO servicios (id, especialidad_id, codigo, nombre, duracion_estimada_minutos, precio_base) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.especialidad_id, s.codigo, s.nombre, s.duracion_estimada_minutos, s.precio_base]
      );
    }

    // 5. Personas
    for (const p of inMemoryStore.personas) {
      await pool.query(
        `INSERT INTO personas (id, tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.tipo_documento, p.numero_documento, p.primer_nombre, p.primer_apellido, p.fecha_nacimiento, p.sexo, p.telefono, p.correo]
      );
    }
    console.log('Personas insertadas');

    // 6. Empleados
    for (const e of inMemoryStore.empleados) {
      await pool.query(
        `INSERT INTO empleados (id, persona_id, codigo_empleado, puesto) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [e.id, e.persona_id, e.codigo_empleado, e.puesto]
      );
    }

    // 7. Profesionales
    for (const p of inMemoryStore.profesionales) {
      await pool.query(
        `INSERT INTO profesionales (id, empleado_id, persona_id, nombre, numero_colegiado, especialidad) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.empleado_id, p.persona_id, p.nombre, p.numero_colegiado, p.especialidad]
      );
    }

    // 8. Pacientes
    for (const p of inMemoryStore.pacientes) {
      await pool.query(
        `INSERT INTO pacientes (id, persona_id, codigo_paciente, nombre_completo, documento, tipo_sangre, telefono, correo, contacto_emergencia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.persona_id, p.codigo_paciente, p.nombre_completo, p.documento, p.tipo_sangre, p.telefono, p.correo, p.contacto_emergencia]
      );
    }
    console.log('Pacientes insertados');

    // 9. Expedientes
    for (const e of inMemoryStore.expedientes) {
      await pool.query(
        `INSERT INTO expedientes (id, paciente_id, numero_expediente, antecedentes_patologicos, antecedentes_alergias, antecedentes_familiares) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [e.id, e.paciente_id, e.numero_expediente, e.antecedentes_patologicos, e.antecedentes_alergias, e.antecedentes_familiares]
      );
    }

    // 10. Citas
    for (const c of inMemoryStore.citas) {
      await pool.query(
        `INSERT INTO citas (id, paciente_id, paciente_nombre, profesional_id, profesional_nombre, sede_id, sede_nombre, servicio_id, servicio_nombre, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO NOTHING`,
        [c.id, c.paciente_id, c.paciente_nombre, c.profesional_id, c.profesional_nombre, c.sede_id, c.sede_nombre, c.servicio_id, c.servicio_nombre, c.fecha_inicio, c.fecha_fin, c.duracion_minutos, c.estado, c.motivo]
      );
    }

    // 12. Usuarios
    for (const u of inMemoryStore.usuarios) {
      await pool.query(
        `INSERT INTO usuarios (id, correo, password_hash, usuario, nombre_completo, rol, persona_id, paciente_id, profesional_id, sedes_autorizadas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
        [u.id, u.correo, u.password_hash, u.usuario, u.nombreCompleto, u.rol, u.personaId, u.pacienteId, u.profesionalId, JSON.stringify(u.sedesAutorizadas)]
      );
    }
    console.log('Usuarios insertados');

    console.log('✅ Seed finalizado correctamente!');
  } catch (err) {
    console.error('Error durante el seed:', err);
  } finally {
    await pool.end();
  }
}

seed();
