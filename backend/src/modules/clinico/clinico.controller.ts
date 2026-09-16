import { Request, Response } from 'express';
import { inMemoryStore } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';
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

  const expediente = inMemoryStore.expedientes.find((e) => e.paciente_id === pacienteId);
  const paciente = inMemoryStore.pacientes.find((p) => p.id === pacienteId);

  if (!expediente) {
    return res.status(404).json({
      ok: false,
      error: 'Expediente clínico no encontrado para el paciente indicado.',
    });
  }

  return res.json({
    ok: true,
    paciente,
    expediente,
  });
};

export const createConsulta = async (req: AuthenticatedRequest, res: Response) => {
  const {
    expediente_id,
    cita_id,
    motivo_consulta,
    examen_fisico,
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

  const expediente = inMemoryStore.expedientes.find((e) => e.id === expediente_id);
  if (!expediente) {
    return res.status(404).json({ ok: false, error: 'Expediente clínico no encontrado.' });
  }

  const nuevaConsulta = {
    id: uuidv4(),
    fecha_atencion: new Date().toISOString(),
    profesional_nombre: req.user?.nombreCompleto || 'Dr. Carlos Mendoza',
    motivo_consulta,
    examen_fisico: examen_fisico || 'Sin particularidades',
    signos_vitales: signos_vitales || {
      presion: '120/80',
      frecuencia_cardiaca: 70,
      temperatura: 36.5,
      peso_kg: 70,
      talla_cm: 170,
    },
    diagnosticos: Array.isArray(diagnosticos) && diagnosticos.length > 0
      ? diagnosticos
      : [{ codigo_cie10: 'Z00.0', descripcion: 'Examen médico general de rutina', tipo: 'DEFINITIVO' }],
    tratamiento: Array.isArray(tratamiento) ? tratamiento : [],
    notas_evolucion: notas_evolucion || 'Paciente atendido satisfactoriamente.',
  };

  expediente.consultas.unshift(nuevaConsulta);

  // Si venía de una cita, actualizar su estado a ATENDIDA
  if (cita_id) {
    const cita = inMemoryStore.citas.find((c) => c.id === cita_id);
    if (cita) {
      cita.estado = 'ATENDIDA';
    }
  }

  // Trazabilidad SQA
  inMemoryStore.auditoria.push({
    id: uuidv4(),
    tabla: 'consulta',
    registro_id: nuevaConsulta.id,
    accion: 'INSERT',
    usuario_nombre: req.user?.nombreCompleto || 'Médico',
    fecha_accion: new Date().toISOString(),
    detalles: `Registro de consulta en expediente ${expediente.numero_expediente}`,
  });

  return res.status(201).json({
    ok: true,
    mensaje: 'Consulta y receta médica registradas con éxito en el expediente clínico.',
    consulta: nuevaConsulta,
  });
};
