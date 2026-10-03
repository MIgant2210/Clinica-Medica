import { pool } from './src/config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validarRegistroUsuario } from './src/modules/auth/auth.validator';

async function testIntegration() {
  console.log('====================================================');
  console.log('🚀 PRUEBA DE INTEGRACIÓN END-TO-END: REGISTRO CLÍNICO');
  console.log('====================================================\n');

  const testEmail = `test.qa.${Date.now()}@clinicmed.gt`;
  const payload = {
    nombre_completo: 'María Mercedes Gómez Estrada',
    correo: testEmail,
    contrasena: 'Clinica2026!Segura',
    confirmar_contrasena: 'Clinica2026!Segura',
    fecha_nacimiento: '1996-05-14',
    numero_documento: '2837' + Math.floor(100000000 + Math.random() * 900000000),
    telefono: '5566-7788',
    sexo: 'FEMENINO',
    tipo_sangre: 'O+',
    terminos_aceptados: true,
  };

  // 1. Validar con SQA Validator
  const validacion = validarRegistroUsuario(payload);
  if (!validacion.isValid || !validacion.sanitized) {
    console.error('❌ Falló la validación:', validacion.errors);
    process.exit(1);
  }
  console.log('✅ 1. Validación SQA completada con éxito.');
  console.log(`   └─ Usuario propuesto: ${validacion.sanitized.usuario}, Edad: ${validacion.sanitized.edad} años`);

  if (!pool) {
    console.log('⚠️ Pool no disponible, omitiendo test de base de datos.');
    process.exit(0);
  }

  const client = await pool.connect();
  let usuarioId = '';
  let personaId = '';
  let pacienteId = '';
  let expedienteId = '';

  try {
    await client.query('BEGIN');

    // 2. Insertar en personas
    const perRes = await client.query(
      `INSERT INTO personas (tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo)
       VALUES ('DPI', $1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        validacion.sanitized.numero_documento,
        validacion.sanitized.primer_nombre,
        validacion.sanitized.primer_apellido,
        validacion.sanitized.fecha_nacimiento,
        validacion.sanitized.sexo,
        validacion.sanitized.telefono,
        validacion.sanitized.correo
      ]
    );
    personaId = perRes.rows[0].id;
    console.log(`✅ 2. Registro en tabla 'personas' creado. ID: ${personaId}`);

    // 3. Insertar en pacientes
    const pacRes = await client.query(
      `INSERT INTO pacientes (persona_id, codigo_paciente, nombre_completo, documento, tipo_sangre, telefono, correo, contacto_emergencia, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Contacto familiar test', 'ACTIVO') RETURNING id, codigo_paciente`,
      [
        personaId,
        'PAC-TEST-' + Math.floor(1000 + Math.random() * 9000),
        validacion.sanitized.nombre_completo,
        validacion.sanitized.numero_documento,
        validacion.sanitized.tipo_sangre,
        validacion.sanitized.telefono,
        validacion.sanitized.correo
      ]
    );
    pacienteId = pacRes.rows[0].id;
    console.log(`✅ 3. Registro en tabla 'pacientes' creado. Código: ${pacRes.rows[0].codigo_paciente}`);

    // 4. Insertar en expedientes
    const expRes = await client.query(
      `INSERT INTO expedientes (paciente_id, numero_expediente, antecedentes_patologicos, antecedentes_alergias, antecedentes_familiares)
       VALUES ($1, $2, 'Sin antecedentes', 'Sin alergias', 'Sin antecedentes familiares') RETURNING id, numero_expediente`,
      [
        pacienteId,
        'EXP-TEST-' + Math.floor(1000 + Math.random() * 9000)
      ]
    );
    expedienteId = expRes.rows[0].id;
    console.log(`✅ 4. Expediente Clínico Electrónico (ECE) creado. No: ${expRes.rows[0].numero_expediente}`);

    // 5. Insertar en usuarios
    const passwordHash = await bcrypt.hash(validacion.sanitized.contrasena, 10);
    const userRes = await client.query(
      `INSERT INTO usuarios (correo, password_hash, usuario, nombre_completo, rol, persona_id, paciente_id, estado, fecha_registro)
       VALUES ($1, $2, $3, $4, 'PACIENTE', $5, $6, 'ACTIVO', NOW()) RETURNING id, usuario, rol`,
      [
        validacion.sanitized.correo,
        passwordHash,
        validacion.sanitized.usuario + Math.floor(100 + Math.random() * 900),
        validacion.sanitized.nombre_completo,
        personaId,
        pacienteId
      ]
    );
    usuarioId = userRes.rows[0].id;
    console.log(`✅ 5. Usuario del sistema creado con Rol: ${userRes.rows[0].rol}, ID: ${usuarioId}`);

    // 6. Insertar en auditoría
    await client.query(
      `INSERT INTO auditoria (tabla, registro_id, accion, usuario_nombre, detalles)
       VALUES ('usuarios', $1, 'REGISTRO_AUTONOMO', $2, 'Prueba de integración exitosa de registro autónomo')`,
      [usuarioId, validacion.sanitized.nombre_completo]
    );
    console.log(`✅ 6. Traza de auditoría ISO 25010 registrada en 'auditoria'.`);

    // 7. Probar autenticación con la contraseña recién cifrada
    const passValida = await bcrypt.compare('Clinica2026!Segura', passwordHash);
    if (!passValida) throw new Error('Bcrypt compare falló');
    console.log(`✅ 7. Verificación de hash Bcrypt exitosa.`);

    // 8. Reversión limpia de prueba (Rollback) para no contaminar base de datos
    await client.query('ROLLBACK');
    console.log(`\n🧹 8. ROLLBACK transaccional ejecutado: Base de datos limpia e inalterada.`);

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE INTEGRACIÓN PASARON EXITOSAMENTE (100%)!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en prueba de integración:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

testIntegration();
