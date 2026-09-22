export type RolUsuario = 'ADMIN' | 'MEDICO' | 'RECEPCIONISTA' | 'PACIENTE';

export interface Usuario {
  id: string;
  usuario: string;
  correo: string;
  rol: RolUsuario;
  nombreCompleto: string;
  profesionalId?: string;
  pacienteId?: string;
  sedesAutorizadas?: string[];
}

export interface Sede {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Especialidad {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface Servicio {
  id: string;
  especialidad_id: string;
  codigo: string;
  nombre: string;
  duracion_estimada_minutos: number;
  precio_base: number;
}

export interface Profesional {
  id: string;
  empleado_id: string;
  persona_id: string;
  nombre: string;
  numero_colegiado: string;
  especialidad: string;
}

export interface Paciente {
  id: string;
  persona_id: string;
  codigo_paciente: string;
  nombre_completo: string;
  documento: string;
  sexo?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  fecha_nacimiento: string;
  tipo_sangre: string;
  telefono: string;
  correo: string;
  contacto_emergencia: string;
  estado: string;
}

export interface Cita {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  profesional_id: string;
  profesional_nombre: string;
  sede_id: string;
  sede_nombre: string;
  servicio_id: string;
  servicio_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_minutos: number;
  estado: 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'REPROGRAMADA' | 'NO_ASISTIO';
  motivo: string;
}

export interface SignosVitales {
  presion: string;
  frecuencia_cardiaca: number;
  temperatura: number;
  peso_kg: number;
  talla_cm: number;
}

export interface Diagnostico {
  codigo_cie10: string;
  descripcion: string;
  tipo: 'PRESUNTIVO' | 'DEFINITIVO';
}

export interface Tratamiento {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion_dias: number;
}

export interface Consulta {
  id: string;
  fecha_atencion: string;
  profesional_nombre: string;
  motivo_consulta: string;
  examen_fisico: string;
  signos_vitales: SignosVitales;
  diagnosticos: Diagnostico[];
  tratamiento: Tratamiento[];
  notas_evolucion: string;
}

export interface ExpedienteClinico {
  id: string;
  paciente_id: string;
  numero_expediente: string;
  antecedentes_patologicos: string;
  antecedentes_alergias: string;
  antecedentes_familiares: string;
  consultas: Consulta[];
}

export interface TrazaAuditoria {
  id: string;
  tabla: string;
  registro_id: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  usuario_nombre: string;
  fecha_accion: string;
  detalles: string;
}
