import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getPacientes = async (req: Request, res: Response) => {
  const { busqueda } = req.query;

  try {
    let query = `
      SELECT p.*, per.sexo, per.fecha_nacimiento 
      FROM pacientes p
      JOIN personas per ON p.persona_id = per.id
    `;
    let params: any[] = [];

    if (busqueda) {
      const termino = `%${String(busqueda).toLowerCase()}%`;
      query += ' WHERE LOWER(p.nombre_completo) LIKE $1 OR p.documento LIKE $1 OR LOWER(p.codigo_paciente) LIKE $1';
      params.push(termino);
    }

    const { rows } = await pool!.query(query, params);

    return res.json({
      ok: true,
      pacientes: rows,
    });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return res.status(500).json({ ok: false, error: 'Error del servidor al obtener pacientes.' });
  }
};

export const getPacienteById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT p.*, per.sexo, per.fecha_nacimiento 
      FROM pacientes p
      JOIN personas per ON p.persona_id = per.id
      WHERE p.id = $1
    `;
    const { rows } = await pool!.query(query, [id]);
    const paciente = rows[0];

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        error: 'Paciente no encontrado.',
      });
    }

    return res.json({
      ok: true,
      paciente,
    });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return res.status(500).json({ ok: false, error: 'Error del servidor al obtener paciente.' });
  }
};

export const createPaciente = async (req: Request, res: Response) => {
    const {
    tipo_documento,
    numero_documento,
    primer_nombre,
    primer_apellido,
    fecha_nacimiento,
    sexo,
    telefono,
    correo,
    tipo_sangre,
    contacto_emergencia_nombre,
    contacto_emergencia_telefono,
    contacto_emergencia,
    antecedentes_alergias,
    antecedentes_patologicos,
  } = req.body;

  if (!tipo_documento || !numero_documento || !primer_nombre || !primer_apellido || !fecha_nacimiento || !sexo) {
    return res.status(400).json({
      ok: false,
      error: 'Faltan campos obligatorios para registrar al paciente.',
    });
  }

  // Validaciones de formato por tipo de documento
  if (tipo_documento === 'DPI') {
    if (!/^\d{13}$/.test(numero_documento)) {
      return res.status(400).json({
        ok: false,
        error: 'El número de DPI solo debe contener 13 dígitos y no aceptar caracteres alfabéticos ni especiales.',
      });
    }
  } else if (tipo_documento === 'PASAPORTE') {
    if (!/^\d{15}$/.test(numero_documento)) {
      return res.status(400).json({
        ok: false,
        error: 'El número de pasaporte solo debe aceptar 15 dígitos y no aceptar caracteres alfabéticos ni especiales.',
      });
    }
  }

  // Validación de número telefónico (8 dígitos)
  let telefonoFormateado = telefono;
  if (telefono && telefono !== 'N/A') {
    const digitosTel = telefono.replace(/\D/g, '');
    if (digitosTel.length !== 8) {
      return res.status(400).json({
        ok: false,
        error: 'El número telefónico debe contener exactamente 8 dígitos (ej. 5500-1122).',
      });
    }
    telefonoFormateado = `${digitosTel.slice(0, 4)}-${digitosTel.slice(4)}`;
  }

  // Validación de teléfono de contacto de emergencia (si se proporciona)
  let contactoTelFormateado = contacto_emergencia_telefono;
  if (contacto_emergencia_telefono && contacto_emergencia_telefono !== 'N/A') {
    const digitosTelEmg = contacto_emergencia_telefono.replace(/\D/g, '');
    if (digitosTelEmg.length !== 8) {
      return res.status(400).json({
        ok: false,
        error: 'El teléfono del contacto de emergencia debe contener exactamente 8 dígitos (ej. 4422-9989).',
      });
    }
    contactoTelFormateado = `${digitosTelEmg.slice(0, 4)}-${digitosTelEmg.slice(4)}`;
  }

  const client = await pool!.connect();

  try {
    await client.query('BEGIN');

    // Verificar documento único (Regla del negocio RF-02)
    const existeResult = await client.query(
      'SELECT id FROM personas WHERE tipo_documento = $1 AND numero_documento = $2',
      [tipo_documento, numero_documento]
    );

    if (existeResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        ok: false,
        error: 'Ya existe una persona registrada con ese número de documento.',
      });
    }

    // Insertar Persona
    const personaResult = await client.query(
      `INSERT INTO personas (tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefonoFormateado, correo]
    );
    const personaId = personaResult.rows[0].id;

    // Generar código de paciente
    const countPacientes = await client.query('SELECT COUNT(*) FROM pacientes');
    const codigoPaciente = `PAC-${new Date().getFullYear()}-${String(parseInt(countPacientes.rows[0].count) + 1).padStart(4, '0')}`;

    // Insertar Paciente
    const nombre_completo = `${primer_nombre} ${primer_apellido}`;
    const finalContactoEmergencia = contacto_emergencia 
      || (contacto_emergencia_nombre ? `${contacto_emergencia_nombre} (${contactoTelFormateado || 'S/T'})` : 'No registrado');
    
    const pacienteResult = await client.query(
      `INSERT INTO pacientes (persona_id, codigo_paciente, nombre_completo, documento, tipo_sangre, telefono, correo, contacto_emergencia)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [personaId, codigoPaciente, nombre_completo, numero_documento, tipo_sangre || 'N/A', telefonoFormateado || 'N/A', correo || 'N/A', finalContactoEmergencia]
    );
    const nuevoPaciente = pacienteResult.rows[0];

    // Generar número de expediente
    const countExpedientes = await client.query('SELECT COUNT(*) FROM expedientes');
    const numeroExpediente = `EXP-${new Date().getFullYear()}-${String(parseInt(countExpedientes.rows[0].count) + 1).padStart(4, '0')}`;

    // Insertar Expediente
    const expedienteResult = await client.query(
      `INSERT INTO expedientes (paciente_id, numero_expediente, antecedentes_patologicos, antecedentes_alergias, antecedentes_familiares)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        nuevoPaciente.id, 
        numeroExpediente, 
        antecedentes_patologicos || 'Ninguno registrado', 
        antecedentes_alergias || 'Ninguna conocida', 
        'No referidos'
      ]
    );
    const nuevoExpediente = expedienteResult.rows[0];

    // Registro en auditoría
    await client.query(
      `INSERT INTO auditoria (tabla, registro_id, accion, usuario_nombre, detalles)
       VALUES ($1, $2, $3, $4, $5)`,
      ['paciente', nuevoPaciente.id, 'INSERT', 'Sistema / Recepción', `Registro de nuevo paciente ${codigoPaciente} (${nombre_completo})`]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      ok: true,
      mensaje: 'Paciente registrado exitosamente con expediente clínico aperturado.',
      paciente: nuevoPaciente,
      expediente: nuevoExpediente,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar paciente:', error);
    return res.status(500).json({ ok: false, error: 'Error del servidor al registrar paciente.' });
  } finally {
    client.release();
  }
};

export const updatePaciente = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    primer_nombre, primer_apellido, tipo_documento, numero_documento,
    fecha_nacimiento, sexo, telefono, correo, tipo_sangre, contacto_emergencia, estado
  } = req.body;

  // Validaciones de formato por tipo de documento si se proporcionan
  if (tipo_documento === 'DPI' && numero_documento) {
    if (!/^\d{13}$/.test(numero_documento)) {
      return res.status(400).json({
        ok: false,
        error: 'El número de DPI solo debe contener 13 dígitos y no aceptar caracteres alfabéticos ni especiales.',
      });
    }
  } else if (tipo_documento === 'PASAPORTE' && numero_documento) {
    if (!/^\d{15}$/.test(numero_documento)) {
      return res.status(400).json({
        ok: false,
        error: 'El número de pasaporte solo debe aceptar 15 dígitos y no aceptar caracteres alfabéticos ni especiales.',
      });
    }
  }

  // Validación de número telefónico (8 dígitos)
  let telefonoFormateado = telefono;
  if (telefono && telefono !== 'N/A') {
    const digitosTel = telefono.replace(/\D/g, '');
    if (digitosTel.length !== 8) {
      return res.status(400).json({
        ok: false,
        error: 'El número telefónico debe contener exactamente 8 dígitos (ej. 5500-1122).',
      });
    }
    telefonoFormateado = `${digitosTel.slice(0, 4)}-${digitosTel.slice(4)}`;
  }

  const client = await pool!.connect();

  try {
    await client.query('BEGIN');

    // Get persona_id
    const pacienteResult = await client.query('SELECT persona_id FROM pacientes WHERE id = $1', [id]);
    if (pacienteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'Paciente no encontrado.' });
    }
    const personaId = pacienteResult.rows[0].persona_id;

    // Update Personas
    await client.query(
      `UPDATE personas
       SET primer_nombre = $1, primer_apellido = $2, tipo_documento = $3, numero_documento = $4,
           fecha_nacimiento = $5, sexo = $6, telefono = $7, correo = $8
       WHERE id = $9`,
      [primer_nombre, primer_apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, telefonoFormateado, correo, personaId]
    );

    // Update Pacientes
    const nombre_completo = `${primer_nombre} ${primer_apellido}`;
    const { rows } = await client.query(
      `UPDATE pacientes 
       SET nombre_completo = $1, documento = $2, telefono = $3, correo = $4, tipo_sangre = $5, contacto_emergencia = $6, estado = $7 
       WHERE id = $8 RETURNING *`,
      [nombre_completo, numero_documento, telefonoFormateado, correo, tipo_sangre, contacto_emergencia, estado || 'ACTIVO', id]
    );

    await client.query('COMMIT');

    return res.json({
      ok: true,
      mensaje: 'Paciente actualizado correctamente.',
      paciente: rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar paciente:', error);
    return res.status(500).json({ ok: false, error: 'Error del servidor al actualizar paciente.' });
  } finally {
    client.release();
  }
};

export const deletePaciente = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = await pool!.connect();

  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT persona_id FROM pacientes WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'Paciente no encontrado.' });
    }

    const personaId = rows[0].persona_id;

    // The foreign keys in DB might restrict this unless ON DELETE CASCADE is set.
    // Assuming simple deletion for now, or just setting estado = 'INACTIVO'
    // I will soft delete to be safe!
    await client.query(`UPDATE pacientes SET estado = 'INACTIVO' WHERE id = $1`, [id]);
    await client.query('COMMIT');

    return res.json({
      ok: true,
      mensaje: 'Paciente inactivado correctamente.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar paciente:', error);
    return res.status(500).json({ ok: false, error: 'Error del servidor al eliminar paciente.' });
  } finally {
    client.release();
  }
};
