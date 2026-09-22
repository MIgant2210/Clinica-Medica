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
    const pacienteRes = await pool!.query('SELECT * FROM pacientes WHERE id = $1', [pacienteId]);
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
        signos_vitales, diagnosticos, tratamiento, notas_evolucion
      ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7) RETURNING *`,
      [expediente_id, profesional_nombre, motivo_consulta, JSON.stringify(sv), JSON.stringify(diag), JSON.stringify(trat), notasFull]
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
