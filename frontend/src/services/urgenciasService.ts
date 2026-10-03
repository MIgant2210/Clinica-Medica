export type NivelTriaje = 'NIVEL_1_ROJO' | 'NIVEL_2_NARANJA' | 'NIVEL_3_AMARILLO' | 'NIVEL_4_VERDE' | 'NIVEL_5_AZUL';

export type EstadoUrgencia = 'EN_ESPERA' | 'EN_BOX' | 'OBSERVACION' | 'ALTA' | 'DERIVADO_HOSPITAL';

export interface PacienteUrgencia {
  id: string;
  codigo_urgencia: string;
  paciente_id?: string;
  paciente_nombre: string;
  edad?: string;
  genero?: string;
  documento?: string;
  motivo_ingreso: string;
  nivel_triaje: NivelTriaje;
  estado: EstadoUrgencia;
  box_asignado?: string;
  medico_asignado?: string;
  fecha_ingreso: string; // ISO string
  signos_vitales: {
    presion: string;
    frecuencia_cardiaca: number;
    temperatura: number;
    spo2: number; // Saturación O2 %
    glasgow: number; // 3 - 15
    escala_dolor: number; // 1 - 10
  };
  observaciones?: string;
  tiempo_espera_max_min: number;
  llamado_activo?: boolean;
}

export interface NivelTriajeMeta {
  nivel: NivelTriaje;
  codigo: string;
  nombre: string;
  tiempoMaxMinutos: number;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorPill: string;
  descripcion: string;
}

export const NIVELES_TRIAJE_MAP: Record<NivelTriaje, NivelTriajeMeta> = {
  NIVEL_1_ROJO: {
    nivel: 'NIVEL_1_ROJO',
    codigo: 'Nivel 1',
    nombre: 'Reanimación / Crítico (Rojo)',
    tiempoMaxMinutos: 0,
    colorBg: 'bg-rose-50 dark:bg-rose-950/40',
    colorBorder: 'border-rose-300 dark:border-rose-800',
    colorText: 'text-rose-700 dark:text-rose-300',
    colorPill: 'bg-rose-600 text-white',
    descripcion: 'Riesgo vital inmediato. Requiere atención y reanimación instantánea.'
  },
  NIVEL_2_NARANJA: {
    nivel: 'NIVEL_2_NARANJA',
    codigo: 'Nivel 2',
    nombre: 'Muy Urgente (Naranja)',
    tiempoMaxMinutos: 15,
    colorBg: 'bg-orange-50 dark:bg-orange-950/40',
    colorBorder: 'border-orange-300 dark:border-orange-800',
    colorText: 'text-orange-700 dark:text-orange-300',
    colorPill: 'bg-orange-500 text-white',
    descripcion: 'Emergencia potencialmente mortal. Tiempo máximo de espera: 15 minutos.'
  },
  NIVEL_3_AMARILLO: {
    nivel: 'NIVEL_3_AMARILLO',
    codigo: 'Nivel 3',
    nombre: 'Urgente (Amarillo)',
    tiempoMaxMinutos: 60,
    colorBg: 'bg-amber-50 dark:bg-amber-950/40',
    colorBorder: 'border-amber-300 dark:border-amber-800',
    colorText: 'text-amber-700 dark:text-amber-300',
    colorPill: 'bg-amber-500 text-white',
    descripcion: 'Situación urgente que requiere pruebas y estabilización rápida (< 60 min).'
  },
  NIVEL_4_VERDE: {
    nivel: 'NIVEL_4_VERDE',
    codigo: 'Nivel 4',
    nombre: 'Estándar / Menos Urgente (Verde)',
    tiempoMaxMinutos: 120,
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    colorBorder: 'border-emerald-300 dark:border-emerald-800',
    colorText: 'text-emerald-700 dark:text-emerald-300',
    colorPill: 'bg-emerald-600 text-white',
    descripcion: 'Problemas agudos estables o moderados sin compromiso vital (< 120 min).'
  },
  NIVEL_5_AZUL: {
    nivel: 'NIVEL_5_AZUL',
    codigo: 'Nivel 5',
    nombre: 'No Urgente (Azul)',
    tiempoMaxMinutos: 240,
    colorBg: 'bg-sky-50 dark:bg-sky-950/40',
    colorBorder: 'border-sky-300 dark:border-sky-800',
    colorText: 'text-sky-700 dark:text-sky-300',
    colorPill: 'bg-sky-600 text-white',
    descripcion: 'Proceso leve o crónico sin riesgo evolutivo rápido. Atención ambulatoria.'
  }
};

const SEED_URGENCIAS: PacienteUrgencia[] = [
  {
    id: 'urg-1',
    codigo_urgencia: 'TR-2601',
    paciente_nombre: 'Carlos Manuel Méndez',
    edad: '45 años',
    genero: 'MASCULINO',
    documento: '2849 10293 0101',
    motivo_ingreso: 'Politraumatismo por colisión vehicular con compromiso respiratorio',
    nivel_triaje: 'NIVEL_1_ROJO',
    estado: 'EN_BOX',
    box_asignado: 'Box 1 - Shock Room',
    medico_asignado: 'Dr. Alejandro Morales (Emergentólogo)',
    fecha_ingreso: new Date(Date.now() - 25 * 60000).toISOString(),
    signos_vitales: {
      presion: '85/50',
      frecuencia_cardiaca: 128,
      temperatura: 35.8,
      spo2: 89,
      glasgow: 10,
      escala_dolor: 9
    },
    observaciones: 'Vía aérea asegurada con collarín rígido. Se canalizan dos vías periféricas.',
    tiempo_espera_max_min: 0,
    llamado_activo: false
  },
  {
    id: 'urg-2',
    codigo_urgencia: 'TR-2602',
    paciente_nombre: 'Sofía Victoria Morales',
    edad: '58 años',
    genero: 'FEMENINO',
    documento: '1920 48201 0101',
    motivo_ingreso: 'Dolor torácico opresivo de 40 min irradiado a mandíbula y diaforesis',
    nivel_triaje: 'NIVEL_2_NARANJA',
    estado: 'EN_BOX',
    box_asignado: 'Box 2 - Reanimación',
    medico_asignado: 'Dra. María Fernández',
    fecha_ingreso: new Date(Date.now() - 12 * 60000).toISOString(),
    signos_vitales: {
      presion: '160/95',
      frecuencia_cardiaca: 98,
      temperatura: 36.6,
      spo2: 95,
      glasgow: 15,
      escala_dolor: 8
    },
    observaciones: 'ECG realizado en primeros 5 min: supradesnivel ST V2-V4. Protocolo SCA activo.',
    tiempo_espera_max_min: 15,
    llamado_activo: false
  },
  {
    id: 'urg-3',
    codigo_urgencia: 'TR-2603',
    paciente_nombre: 'Andrea Gómez de León',
    edad: '27 años',
    genero: 'FEMENINO',
    documento: '3001 92834 0101',
    motivo_ingreso: 'Dolor abdominal agudo en fosa ilíaca derecha, náuseas y fiebre 38.9°C',
    nivel_triaje: 'NIVEL_3_AMARILLO',
    estado: 'EN_ESPERA',
    box_asignado: 'Box 4 - Consulta Rápida',
    medico_asignado: 'Dr. Roberto Soto',
    fecha_ingreso: new Date(Date.now() - 35 * 60000).toISOString(),
    signos_vitales: {
      presion: '115/75',
      frecuencia_cardiaca: 92,
      temperatura: 38.9,
      spo2: 98,
      glasgow: 15,
      escala_dolor: 7
    },
    observaciones: 'Signo de Blumberg dudoso positivo. Pendiente analítica y eco abdominal.',
    tiempo_espera_max_min: 60,
    llamado_activo: true
  },
  {
    id: 'urg-4',
    codigo_urgencia: 'TR-2604',
    paciente_nombre: 'Mario David Castillo',
    edad: '34 años',
    genero: 'MASCULINO',
    documento: '2109 49201 0101',
    motivo_ingreso: 'Traumatismo cerrado de tobillo derecho con edema e impotencia funcional',
    nivel_triaje: 'NIVEL_4_VERDE',
    estado: 'EN_ESPERA',
    box_asignado: 'Box 3 - Traumatología',
    medico_asignado: 'Dra. Lucrecia Estrada',
    fecha_ingreso: new Date(Date.now() - 45 * 60000).toISOString(),
    signos_vitales: {
      presion: '125/80',
      frecuencia_cardiaca: 76,
      temperatura: 36.4,
      spo2: 99,
      glasgow: 15,
      escala_dolor: 5
    },
    observaciones: 'Pasa a rayos X para descartar fractura maleolar.',
    tiempo_espera_max_min: 120,
    llamado_activo: false
  },
  {
    id: 'urg-5',
    codigo_urgencia: 'TR-2605',
    paciente_nombre: 'Elena Lucía Ramos',
    edad: '19 años',
    genero: 'FEMENINO',
    documento: '3210 94821 0101',
    motivo_ingreso: 'Crisis asmática moderada con sibilancias espiratorias bilaterales',
    nivel_triaje: 'NIVEL_3_AMARILLO',
    estado: 'OBSERVACION',
    box_asignado: 'Box 6 - Observación',
    medico_asignado: 'Dr. Alejandro Morales',
    fecha_ingreso: new Date(Date.now() - 80 * 60000).toISOString(),
    signos_vitales: {
      presion: '120/78',
      frecuencia_cardiaca: 95,
      temperatura: 36.7,
      spo2: 94,
      glasgow: 15,
      escala_dolor: 3
    },
    observaciones: 'En nebulización con Salbutamol + Bromuro de Ipratropio. Buena respuesta inicial.',
    tiempo_espera_max_min: 60,
    llamado_activo: false
  }
];

const STORAGE_KEY = 'clinica_urgencias_triaje_v1';

export const getPacientesUrgencias = (): PacienteUrgencia[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error al cargar pacientes de urgencias:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_URGENCIAS));
  return SEED_URGENCIAS;
};

export const guardarPacienteUrgencia = (nuevo: PacienteUrgencia): PacienteUrgencia[] => {
  const actuales = getPacientesUrgencias();
  const actualizados = [nuevo, ...actuales];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};

export const actualizarEstadoUrgencia = (
  id: string, 
  nuevoEstado: EstadoUrgencia, 
  box?: string
): PacienteUrgencia[] => {
  const actuales = getPacientesUrgencias();
  const actualizados = actuales.map(p => {
    if (p.id === id) {
      return {
        ...p,
        estado: nuevoEstado,
        box_asignado: box !== undefined ? box : p.box_asignado,
        llamado_activo: false
      };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};

export const alternarLlamadoPaciente = (id: string, activar: boolean): PacienteUrgencia[] => {
  const actuales = getPacientesUrgencias();
  const actualizados = actuales.map(p => {
    if (p.id === id) {
      return { ...p, llamado_activo: activar };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};
