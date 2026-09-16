import { Request, Response } from 'express';
import { inMemoryStore } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getPacientes = async (req: Request, res: Response) => {
  const { busqueda } = req.query;

  let listado = inMemoryStore.pacientes;

  if (busqueda) {
    const termino = String(busqueda).toLowerCase();
    listado = listado.filter(
      (p) =>
        p.nombre_completo.toLowerCase().includes(termino) ||
        p.documento.includes(termino) ||
        p.codigo_paciente.toLowerCase().includes(termino)
    );
  }

  return res.json({
    ok: true,
    pacientes: listado,
  });
};

export const getPacienteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const paciente = inMemoryStore.pacientes.find((p) => p.id === id);

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
  } = req.body;

  if (!tipo_documento || !numero_documento || !primer_nombre || !primer_apellido || !fecha_nacimiento || !sexo) {
    return res.status(400).json({
      ok: false,
      error: 'Faltan campos obligatorios para registrar al paciente.',
    });
  }

  // Verificar documento único (Regla del negocio RF-02)
  const existePersona = inMemoryStore.personas.find(
    (p) => p.tipo_documento === tipo_documento && p.numero_documento === numero_documento
  );

  if (existePersona) {
    return res.status(409).json({
      ok: false,
      error: 'Ya existe una persona registrada con ese número de documento.',
    });
  }

  const personaId = uuidv4();
  const pacienteId = uuidv4();
  const expedienteId = uuidv4();
  const codigoPaciente = `PAC-${new Date().getFullYear()}-${String(inMemoryStore.pacientes.length + 1).padStart(4, '0')}`;
  const numeroExpediente = `EXP-${new Date().getFullYear()}-${String(inMemoryStore.expedientes.length + 1).padStart(4, '0')}`;

  const nuevaPersona = {
    id: personaId,
    tipo_documento,
    numero_documento,
    primer_nombre,
    primer_apellido,
    fecha_nacimiento,
    sexo,
    telefono,
    correo,
  };

  const nuevoPaciente = {
    id: pacienteId,
    persona_id: personaId,
    codigo_paciente: codigoPaciente,
    nombre_completo: `${primer_nombre} ${primer_apellido}`,
    documento: numero_documento,
    tipo_sangre: tipo_sangre || 'N/A',
    telefono: telefono || 'N/A',
    correo: correo || 'N/A',
    contacto_emergencia: contacto_emergencia_nombre
      ? `${contacto_emergencia_nombre} (${contacto_emergencia_telefono || 'S/T'})`
      : 'No registrado',
  };

  const nuevoExpediente = {
    id: expedienteId,
    paciente_id: pacienteId,
    numero_expediente: numeroExpediente,
    antecedentes_patologicos: 'Ninguno registrado',
    antecedentes_alergias: 'Ninguna conocida',
    antecedentes_familiares: 'No referidos',
    consultas: [],
  };

  inMemoryStore.personas.push(nuevaPersona);
  inMemoryStore.pacientes.push(nuevoPaciente);
  inMemoryStore.expedientes.push(nuevoExpediente);

  // Registro en auditoría
  inMemoryStore.auditoria.push({
    id: uuidv4(),
    tabla: 'paciente',
    registro_id: pacienteId,
    accion: 'INSERT',
    usuario_nombre: 'Sistema / Recepción',
    fecha_accion: new Date().toISOString(),
    detalles: `Registro de nuevo paciente ${codigoPaciente} (${primer_nombre} ${primer_apellido})`,
  });

  return res.status(201).json({
    ok: true,
    mensaje: 'Paciente registrado exitosamente con expediente clínico aperturado.',
    paciente: nuevoPaciente,
    expediente: nuevoExpediente,
  });
};
