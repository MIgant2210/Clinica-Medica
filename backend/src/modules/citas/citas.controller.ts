import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const getCitas = async (req: AuthenticatedRequest, res: Response) => {
  const { profesionalId, pacienteId, estado, fecha } = req.query;

  try {
    let query = 'SELECT * FROM citas WHERE 1=1';
    let params: any[] = [];
    let paramIndex = 1;

    // Si el usuario es médico y no es admin, solo puede ver sus citas
    if (req.user?.rol === 'MEDICO' && req.user?.profesionalId) {
      query += ` AND profesional_id = $${paramIndex++}`;
      params.push(req.user.profesionalId);
    } else if (profesionalId) {
      query += ` AND profesional_id = $${paramIndex++}`;
      params.push(profesionalId);
    }

    // Si el usuario es paciente, solo ve sus citas
    if (req.user?.rol === 'PACIENTE' && req.user?.pacienteId) {
      query += ` AND paciente_id = $${paramIndex++}`;
      params.push(req.user.pacienteId);
    } else if (pacienteId) {
      query += ` AND paciente_id = $${paramIndex++}`;
      params.push(pacienteId);
    }

    if (estado) {
      query += ` AND estado = $${paramIndex++}`;
      params.push(estado);
    }

    if (fecha) {
      // Comparar solo la fecha, ignorando la hora
      query += ` AND DATE(fecha_inicio) = $${paramIndex++}`;
      params.push(fecha);
    }

    // Ordenar citas por fecha
    query += ` ORDER BY fecha_inicio ASC`;

    const { rows } = await pool!.query(query, params);

    return res.json({
      ok: true,
      citas: rows,
    });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al obtener las citas' });
  }
};

export const createCita = async (req: AuthenticatedRequest, res: Response) => {
  const {
    paciente_id,
    profesional_id,
    sede_id,
    servicio_id,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    motivo,
    modalidad = 'PRESENCIAL',
    enlace_telemedicina = null,
  } = req.body;

  // QA-03: Obligatoriedad de datos
  if (!paciente_id || !profesional_id || !sede_id || !servicio_id || !fecha_inicio || !fecha_fin || !duracion_minutos || !motivo) {
    return res.status(400).json({
      ok: false,
      error: 'Error de validación SQA: Faltan campos obligatorios para agendar la cita médica.',
    });
  }

  const duracion = Number(duracion_minutos);
  const inicioDate = new Date(fecha_inicio);
  const finDate = new Date(fecha_fin);

  // QA-01 y QA-02 y QA-07: Condiciones de Borde (15 min <= duracion <= 120 min)
  if (duracion < 15 || duracion > 120) {
    return res.status(422).json({
      ok: false,
      codigo_error: 'QA_ERROR_BORDE',
      error: `Violación de regla SQA (Condición de borde): La duración debe estar entre 15 y 120 minutos. Recibido: ${duracion} minutos.`,
    });
  }

  // QA-06: Coherencia temporal
  if (finDate <= inicioDate) {
    return res.status(422).json({
      ok: false,
      codigo_error: 'QA_ERROR_FECHAS',
      error: 'Violación de regla SQA: La fecha y hora de fin debe ser estrictamente posterior a la de inicio.',
    });
  }

  const client = await pool!.connect();

  try {
    await client.query('BEGIN');

    // RN-02: Prevenir traslape de horario para el mismo profesional
    const traslapeResult = await client.query(
      `SELECT id FROM citas 
       WHERE profesional_id = $1 
       AND estado IN ('PROGRAMADA', 'CONFIRMADA')
       AND (
         ($2 >= fecha_inicio AND $2 < fecha_fin) OR 
         ($3 > fecha_inicio AND $3 <= fecha_fin) OR
         ($2 <= fecha_inicio AND $3 >= fecha_fin)
       )`,
      [profesional_id, inicioDate.toISOString(), finDate.toISOString()]
    );

    if (traslapeResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        ok: false,
        codigo_error: 'RN_02_TRASLAPE_HORARIO',
        error: 'Conflicto de agenda: El profesional de la salud ya tiene una cita activa asignada en ese horario.',
      });
    }

    // Resolver nombres legibles
    const pacienteRes = await client.query('SELECT nombre_completo FROM pacientes WHERE id = $1', [paciente_id]);
    const profesionalRes = await client.query('SELECT nombre FROM profesionales WHERE id = $1', [profesional_id]);
    const sedeRes = await client.query('SELECT nombre FROM sedes WHERE id = $1', [sede_id]);
    const servicioRes = await client.query('SELECT nombre FROM servicios WHERE id = $1', [servicio_id]);

    const pacienteNombre = pacienteRes.rows[0]?.nombre_completo || 'Paciente';
    const profesionalNombre = profesionalRes.rows[0]?.nombre || 'Profesional Médico';
    const sedeNombre = sedeRes.rows[0]?.nombre || 'Sede';
    const servicioNombre = servicioRes.rows[0]?.nombre || 'Consulta General';

    // Insertar cita
    const citaResult = await client.query(
      `INSERT INTO citas (
        paciente_id, paciente_nombre, profesional_id, profesional_nombre, 
        sede_id, sede_nombre, servicio_id, servicio_nombre, 
        fecha_inicio, fecha_fin, duracion_minutos, estado, motivo, modalidad, enlace_telemedicina
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        paciente_id, pacienteNombre, profesional_id, profesionalNombre,
        sede_id, sedeNombre, servicio_id, servicioNombre,
        inicioDate.toISOString(), finDate.toISOString(), duracion, 'PROGRAMADA', motivo, modalidad, enlace_telemedicina
      ]
    );
    const nuevaCita = citaResult.rows[0];

    // Registro en auditoría
    await client.query(
      `INSERT INTO auditoria (tabla, registro_id, accion, usuario_nombre, detalles)
       VALUES ($1, $2, $3, $4, $5)`,
      ['cita', nuevaCita.id, 'INSERT', req.user?.nombreCompleto || 'Usuario', `Cita agendada para ${nuevaCita.paciente_nombre} el ${nuevaCita.fecha_inicio}`]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      ok: true,
      mensaje: 'Cita programada exitosamente.',
      cita: nuevaCita,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al agendar cita:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al agendar cita' });
  } finally {
    client.release();
  }
};

export const updateEstadoCita = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { estado } = req.body;

  // QA-04: Dominio de estados válidos
  const estadosValidos = ['PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'REPROGRAMADA', 'NO_ASISTIO'];
  if (!estadosValidos.includes(estado)) {
    return res.status(422).json({
      ok: false,
      codigo_error: 'QA_ERROR_DOMINIO',
      error: `Violación de regla SQA (Dominio): Estado '${estado}' no permitido. Valores válidos: ${estadosValidos.join(', ')}`,
    });
  }

  const client = await pool!.connect();

  try {
    await client.query('BEGIN');

    const citaResult = await client.query('SELECT estado, id FROM citas WHERE id = $1', [id]);
    if (citaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'Cita médica no encontrada.' });
    }

    const estadoAnterior = citaResult.rows[0].estado;

    const updateResult = await client.query('UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *', [estado, id]);
    const citaActualizada = updateResult.rows[0];

    // QA-10: Auditoría automática tras UPDATE
    await client.query(
      `INSERT INTO auditoria (tabla, registro_id, accion, usuario_nombre, detalles)
       VALUES ($1, $2, $3, $4, $5)`,
      ['cita', id, 'UPDATE', req.user?.nombreCompleto || 'Usuario', `Cambio de estado de cita: de ${estadoAnterior} a ${estado}`]
    );

    await client.query('COMMIT');

    return res.json({
      ok: true,
      mensaje: `Estado de la cita actualizado a ${estado}.`,
      cita: citaActualizada,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar cita:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al actualizar la cita' });
  } finally {
    client.release();
  }
};
