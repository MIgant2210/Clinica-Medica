import { Request, Response } from 'express';
import { inMemoryStore } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const getCitas = async (req: AuthenticatedRequest, res: Response) => {
  const { profesionalId, pacienteId, estado, fecha } = req.query;

  let listado = inMemoryStore.citas;

  // Si el usuario es médico y no es admin, solo puede ver sus citas
  if (req.user?.rol === 'MEDICO' && req.user?.profesionalId) {
    listado = listado.filter((c) => c.profesional_id === req.user?.profesionalId);
  } else if (profesionalId) {
    listado = listado.filter((c) => c.profesional_id === profesionalId);
  }

  // Si el usuario es paciente, solo ve sus citas
  if (req.user?.rol === 'PACIENTE' && req.user?.pacienteId) {
    listado = listado.filter((c) => c.paciente_id === req.user?.pacienteId);
  } else if (pacienteId) {
    listado = listado.filter((c) => c.paciente_id === pacienteId);
  }

  if (estado) {
    listado = listado.filter((c) => c.estado === estado);
  }

  if (fecha) {
    listado = listado.filter((c) => c.fecha_inicio.startsWith(String(fecha)));
  }

  return res.json({
    ok: true,
    citas: listado,
  });
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

  // RN-02: Prevenir traslape de horario para el mismo profesional
  const tieneConflicto = inMemoryStore.citas.some((c) => {
    if (c.profesional_id !== profesional_id) return false;
    if (c.estado !== 'PROGRAMADA' && c.estado !== 'CONFIRMADA') return false;

    const cInicio = new Date(c.fecha_inicio);
    const cFin = new Date(c.fecha_fin);

    return (
      (inicioDate >= cInicio && inicioDate < cFin) ||
      (finDate > cInicio && finDate <= cFin) ||
      (inicioDate <= cInicio && finDate >= cFin)
    );
  });

  if (tieneConflicto) {
    return res.status(409).json({
      ok: false,
      codigo_error: 'RN_02_TRASLAPE_HORARIO',
      error: 'Conflicto de agenda: El profesional de la salud ya tiene una cita activa asignada en ese horario.',
    });
  }

  // Resolver nombres legibles
  const paciente = inMemoryStore.pacientes.find((p) => p.id === paciente_id);
  const profesional = inMemoryStore.profesionales.find((p) => p.id === profesional_id);
  const sede = inMemoryStore.sedes.find((s) => s.id === sede_id);
  const servicio = inMemoryStore.servicios.find((s) => s.id === servicio_id);

  const nuevaCita = {
    id: uuidv4(),
    paciente_id,
    paciente_nombre: paciente?.nombre_completo || 'Paciente',
    profesional_id,
    profesional_nombre: profesional?.nombre || 'Profesional Médico',
    sede_id,
    sede_nombre: sede?.nombre || 'Sede',
    servicio_id,
    servicio_nombre: servicio?.nombre || 'Consulta General',
    fecha_inicio: inicioDate.toISOString(),
    fecha_fin: finDate.toISOString(),
    duracion_minutos: duracion,
    estado: 'PROGRAMADA',
    motivo,
  };

  inMemoryStore.citas.push(nuevaCita);

  // Registro en auditoría
  inMemoryStore.auditoria.push({
    id: uuidv4(),
    tabla: 'cita',
    registro_id: nuevaCita.id,
    accion: 'INSERT',
    usuario_nombre: req.user?.nombreCompleto || 'Usuario',
    fecha_accion: new Date().toISOString(),
    detalles: `Cita agendada para ${nuevaCita.paciente_nombre} el ${nuevaCita.fecha_inicio}`,
  });

  return res.status(201).json({
    ok: true,
    mensaje: 'Cita programada exitosamente.',
    cita: nuevaCita,
  });
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

  const cita = inMemoryStore.citas.find((c) => c.id === id);
  if (!cita) {
    return res.status(404).json({ ok: false, error: 'Cita médica no encontrada.' });
  }

  const estadoAnterior = cita.estado;
  cita.estado = estado;

  // QA-10: Auditoría automática tras UPDATE
  inMemoryStore.auditoria.push({
    id: uuidv4(),
    tabla: 'cita',
    registro_id: cita.id,
    accion: 'UPDATE',
    usuario_nombre: req.user?.nombreCompleto || 'Usuario',
    fecha_accion: new Date().toISOString(),
    detalles: `Cambio de estado de cita: de ${estadoAnterior} a ${estado}`,
  });

  return res.json({
    ok: true,
    mensaje: `Estado de la cita actualizado a ${estado}.`,
    cita,
  });
};
