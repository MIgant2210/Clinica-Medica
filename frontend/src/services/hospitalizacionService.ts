export type AlaHospital = 'UCI' | 'MEDICINA_INTERNA' | 'CIRUGIA' | 'MATERNIDAD' | 'PEDIATRIA' | 'URGENCIAS_OBS';

export type EstadoCama = 'DISPONIBLE' | 'OCUPADA' | 'LIMPIEZA' | 'MANTENIMIENTO';

export interface CamaHospital {
  id: string;
  codigo: string;
  ala: AlaHospital;
  habitacion: string;
  estado: EstadoCama;
  paciente_id?: string;
  paciente_nombre?: string;
  diagnostico_ingreso?: string;
  medico_a_cargo?: string;
  fecha_ingreso?: string;
  equipamiento?: string[];
  notas_enfermeria?: string;
}

export const ALAS_INFO: Record<AlaHospital, { nombre: string; descripcion: string; iconoColor: string }> = {
  UCI: {
    nombre: 'Unidad de Cuidados Intensivos (UCI)',
    descripcion: 'Soporte vital crítico y monitoreo hemodinámico continuo',
    iconoColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900'
  },
  MEDICINA_INTERNA: {
    nombre: 'Medicina Interna',
    descripcion: 'Tratamiento y hospitalización médica de adultos',
    iconoColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900'
  },
  CIRUGIA: {
    nombre: 'Cirugía & Postoperatorio',
    descripcion: 'Recuperación quirúrgica y cuidados perioperatorios',
    iconoColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900'
  },
  MATERNIDAD: {
    nombre: 'Maternidad & Obstetricia',
    descripcion: 'Atención al parto, puerperio y alojamiento conjunto',
    iconoColor: 'text-pink-600 bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-900'
  },
  PEDIATRIA: {
    nombre: 'Pediatría Hospitalaria',
    descripcion: 'Cuidados especializados para lactantes y niños',
    iconoColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900'
  },
  URGENCIAS_OBS: {
    nombre: 'Observación de Urgencias',
    descripcion: 'Estabilización transitoria y valoración corta estancia',
    iconoColor: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900'
  }
};

const SEED_CAMAS: CamaHospital[] = [
  // UCI
  {
    id: 'cama-uci-1',
    codigo: 'UCI-01',
    ala: 'UCI',
    habitacion: 'Box Crítico 101',
    estado: 'OCUPADA',
    paciente_nombre: 'Carlos Manuel Méndez',
    diagnostico_ingreso: 'Shock hipovolémico / Trauma torácico cerrado',
    medico_a_cargo: 'Dr. Alejandro Morales',
    fecha_ingreso: '2026-10-01',
    equipamiento: ['Ventilador Mecánico Hamilton', 'Monitor Philips IntelliVue', 'Bomba Infusión Baxter (x3)'],
    notas_enfermeria: 'Sedación RASS -4. Parámetros ventilatorios estables. Diuresis horaria controlada.'
  },
  {
    id: 'cama-uci-2',
    codigo: 'UCI-02',
    ala: 'UCI',
    habitacion: 'Box Crítico 102',
    estado: 'DISPONIBLE',
    equipamiento: ['Ventilador Mecánico', 'Monitor Multiparámetro', 'Desfibrilador'],
    notas_enfermeria: 'Cama esterilizada y lista para ingreso inmediato.'
  },
  {
    id: 'cama-uci-3',
    codigo: 'UCI-03',
    ala: 'UCI',
    habitacion: 'Box Crítico 103',
    estado: 'LIMPIEZA',
    equipamiento: ['Monitor Multiparámetro', 'Bomba de Infusión'],
    notas_enfermeria: 'En proceso de desinfección terminal por equipo de esterilización.'
  },

  // MEDICINA INTERNA
  {
    id: 'cama-med-1',
    codigo: 'MED-201',
    ala: 'MEDICINA_INTERNA',
    habitacion: 'Habitación 201-A',
    estado: 'OCUPADA',
    paciente_nombre: 'Lucía Fernández Díaz',
    diagnostico_ingreso: 'Neumonía adquirida en la comunidad + EPOC exacerbado',
    medico_a_cargo: 'Dra. Lucrecia Estrada',
    fecha_ingreso: '2026-09-30',
    equipamiento: ['Flujómetro de Oxígeno', 'Pulsioxímetro', 'Atril de Suero'],
    notas_enfermeria: 'O2 por cánula nasal a 2L/min. Tratamiento antibiótico IV día 3.'
  },
  {
    id: 'cama-med-2',
    codigo: 'MED-202',
    ala: 'MEDICINA_INTERNA',
    habitacion: 'Habitación 201-B',
    estado: 'DISPONIBLE',
    equipamiento: ['Atril de Suero', 'Timbre de Asistencia'],
    notas_enfermeria: 'Disponible para internamiento.'
  },
  {
    id: 'cama-med-3',
    codigo: 'MED-203',
    ala: 'MEDICINA_INTERNA',
    habitacion: 'Habitación 202-A',
    estado: 'OCUPADA',
    paciente_nombre: 'Fernando Rivas Estrada',
    diagnostico_ingreso: 'Diabetes mellitus descompensada / Cetoacidosis euglucémica',
    medico_a_cargo: 'Dr. Roberto Soto',
    fecha_ingreso: '2026-10-02',
    equipamiento: ['Glucómetro de guardia', 'Bomba de Insulina IV'],
    notas_enfermeria: 'Curva glucémica cada 2 horas. Electrolitos séricos en mejoría.'
  },

  // CIRUGIA
  {
    id: 'cama-cir-1',
    codigo: 'CIR-301',
    ala: 'CIRUGIA',
    habitacion: 'Habitación 301',
    estado: 'OCUPADA',
    paciente_nombre: 'Andrea Gómez de León',
    diagnostico_ingreso: 'Postoperatorio inmediato: Apendicectomía laparoscópica',
    medico_a_cargo: 'Dr. David Valenzuela (Cirujano)',
    fecha_ingreso: '2026-10-02',
    equipamiento: ['Drenaje quirúrgico', 'Bomba de Analgesia PCA'],
    notas_enfermeria: 'Heridas quirúrgicas limpias sin sangrado. Tolerando dieta líquida.'
  },
  {
    id: 'cama-cir-2',
    codigo: 'CIR-302',
    ala: 'CIRUGIA',
    habitacion: 'Habitación 302',
    estado: 'DISPONIBLE',
    equipamiento: ['Atril de Suero', 'Silla de Ruedas asignada'],
    notas_enfermeria: 'Cama lista para postquirúrgico electivo.'
  },

  // MATERNIDAD
  {
    id: 'cama-mat-1',
    codigo: 'MAT-401',
    ala: 'MATERNIDAD',
    habitacion: 'Suite Maternal 401',
    estado: 'OCUPADA',
    paciente_nombre: 'Gabriela Paz Osorio',
    diagnostico_ingreso: 'Puerperio fisiológico + Recién nacido sano (3,250g)',
    medico_a_cargo: 'Dra. Claudia Barillas (Ginecóloga)',
    fecha_ingreso: '2026-10-01',
    equipamiento: ['Cuna Térmica Neonatal', 'Sillón de Lactancia Ergonómico'],
    notas_enfermeria: 'Lactancia materna exclusiva eficaz. Signos vitales maternos estables.'
  },
  {
    id: 'cama-mat-2',
    codigo: 'MAT-402',
    ala: 'MATERNIDAD',
    habitacion: 'Suite Maternal 402',
    estado: 'DISPONIBLE',
    equipamiento: ['Cuna Neonatal', 'Monitor Doppler fetal'],
    notas_enfermeria: 'Habitación limpia con insumos obstétricos completos.'
  },

  // OBSERVACION URGENCIAS
  {
    id: 'cama-urg-1',
    codigo: 'OBS-01',
    ala: 'URGENCIAS_OBS',
    habitacion: 'Sala Observación Urgencias',
    estado: 'OCUPADA',
    paciente_nombre: 'Elena Lucía Ramos',
    diagnostico_ingreso: 'Crisis asmática moderada en protocolo de nebulización',
    medico_a_cargo: 'Dr. Alejandro Morales',
    fecha_ingreso: '2026-10-02',
    equipamiento: ['Nebulizador Ultrasónico', 'Monitor Portátil SpO2'],
    notas_enfermeria: 'Flujo espiratorio pico mejorado. Revaloración en 2 horas para alta o internamiento.'
  },
  {
    id: 'cama-urg-2',
    codigo: 'OBS-02',
    ala: 'URGENCIAS_OBS',
    habitacion: 'Sala Observación Urgencias',
    estado: 'DISPONIBLE',
    equipamiento: ['Monitor de Signos Vitales', 'Toma de Oxígeno'],
    notas_enfermeria: 'Cama de observación disponible.'
  },
  {
    id: 'cama-urg-3',
    codigo: 'OBS-03',
    ala: 'URGENCIAS_OBS',
    habitacion: 'Sala Observación Urgencias',
    estado: 'MANTENIMIENTO',
    equipamiento: ['Toma de Oxígeno en calibración'],
    notas_enfermeria: 'En calibración técnica de tomas de vacío y oxígeno.'
  }
];

const STORAGE_KEY = 'clinica_hospitalizacion_camas_v1';

export const getCamasHospital = (): CamaHospital[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error al cargar camas de hospitalización:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CAMAS));
  return SEED_CAMAS;
};

export const asignarCama = (
  camaId: string, 
  datos: {
    paciente_id?: string;
    paciente_nombre: string;
    diagnostico_ingreso: string;
    medico_a_cargo: string;
    fecha_ingreso: string;
    notas_enfermeria?: string;
  }
): CamaHospital[] => {
  const actuales = getCamasHospital();
  const actualizados = actuales.map(c => {
    if (c.id === camaId) {
      return {
        ...c,
        estado: 'OCUPADA' as EstadoCama,
        paciente_id: datos.paciente_id,
        paciente_nombre: datos.paciente_nombre,
        diagnostico_ingreso: datos.diagnostico_ingreso,
        medico_a_cargo: datos.medico_a_cargo,
        fecha_ingreso: datos.fecha_ingreso,
        notas_enfermeria: datos.notas_enfermeria || 'Ingreso registrado en planta hospitalaria.'
      };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};

export const liberarCama = (camaId: string, enviarALimpieza: boolean = true): CamaHospital[] => {
  const actuales = getCamasHospital();
  const actualizados = actuales.map(c => {
    if (c.id === camaId) {
      return {
        ...c,
        estado: (enviarALimpieza ? 'LIMPIEZA' : 'DISPONIBLE') as EstadoCama,
        paciente_id: undefined,
        paciente_nombre: undefined,
        diagnostico_ingreso: undefined,
        medico_a_cargo: undefined,
        fecha_ingreso: undefined,
        notas_enfermeria: enviarALimpieza ? 'Alta médica concedida. Pendiente desinfección y cambio de ropa.' : 'Cama disponible.'
      };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};

export const cambiarEstadoCama = (camaId: string, nuevoEstado: EstadoCama): CamaHospital[] => {
  const actuales = getCamasHospital();
  const actualizados = actuales.map(c => {
    if (c.id === camaId) {
      return {
        ...c,
        estado: nuevoEstado,
        ...(nuevoEstado === 'DISPONIBLE' && !c.paciente_nombre ? { notas_enfermeria: 'Cama higienizada y operativa.' } : {})
      };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};
