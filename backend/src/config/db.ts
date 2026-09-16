import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export let pool: Pool | null = null;
export let isDatabaseConnected = false;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    pool.on('error', (err) => {
      console.error('Error imprevisto en el pool de PostgreSQL:', err.message);
    });

    // Probar conexión inicial
    pool.query('SELECT NOW()')
      .then(() => {
        isDatabaseConnected = true;
        console.log('✅ [DATABASE] Conexión exitosa a PostgreSQL / Supabase.');
      })
      .catch((err) => {
        console.warn('⚠️ [DATABASE] No se pudo conectar a PostgreSQL (' + err.message + ').');
        console.log('ℹ️ [MODO DUAL] Activando almacén en memoria para permitir pruebas y desarrollo sin interrupciones.');
        isDatabaseConnected = false;
      });
  } catch (error: any) {
    console.warn('⚠️ Error al inicializar pool de PostgreSQL:', error.message);
    isDatabaseConnected = false;
  }
} else {
  console.log('ℹ️ [MODO DUAL] No se especificó DATABASE_URL. Operando con almacén en memoria inicializado con datos semilla.');
}

// =============================================================================
// ALMACÉN EN MEMORIA (FALLBACK INMEDIATO)
// Permite que el sistema funcione completo antes de configurar la base de datos
// =============================================================================

export interface MockStore {
  organizaciones: any[];
  sedes: any[];
  areas: any[];
  especialidades: any[];
  servicios: any[];
  personas: any[];
  empleados: any[];
  profesionales: any[];
  pacientes: any[];
  expedientes: any[];
  citas: any[];
  consultas: any[];
  usuarios: any[];
  auditoria: any[];
}

export const inMemoryStore: MockStore = {
  organizaciones: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      codigo: 'ORG-SALUD',
      nombre: 'Red de Clínicas y Especialidades Médicas S.A.',
      numero_tributario: '8493021-4',
      telefono: '2200-1100',
      correo: 'contacto@redsalud.gt'
    }
  ],
  sedes: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      codigo: 'SEDE-Z10',
      nombre: 'Sede Zona 10 (Central)',
      direccion: '10ma Calle 3-40 Zona 10, Edificio Médico',
      telefono: '2200-1101'
    },
    {
      id: '22222222-2222-2222-2222-333333333333',
      codigo: 'SEDE-Z01',
      nombre: 'Sede Centro Histórico',
      direccion: '6ta Avenida 4-20 Zona 1',
      telefono: '2200-1102'
    }
  ],
  areas: [
    {
      id: '33333333-3333-3333-3333-333333333333',
      sede_id: '22222222-2222-2222-2222-222222222222',
      codigo: 'AR-EXT',
      nombre: 'Consulta Externa',
      piso_ubicacion: 'Nivel 2, Módulo A'
    }
  ],
  especialidades: [
    {
      id: '44444444-4444-4444-4444-111111111111',
      codigo: 'ESP-MG',
      nombre: 'Medicina General',
      descripcion: 'Atención primaria integral y prevención'
    },
    {
      id: '44444444-4444-4444-4444-222222222222',
      codigo: 'ESP-PED',
      nombre: 'Pediatría',
      descripcion: 'Cuidado y control del desarrollo infantil'
    },
    {
      id: '44444444-4444-4444-4444-333333333333',
      codigo: 'ESP-CARD',
      nombre: 'Cardiología',
      descripcion: 'Diagnóstico y tratamiento cardiovascular'
    }
  ],
  servicios: [
    {
      id: '55555555-5555-5555-5555-111111111111',
      especialidad_id: '44444444-4444-4444-4444-111111111111',
      codigo: 'SRV-CG01',
      nombre: 'Consulta Medicina General',
      duracion_estimada_minutos: 30,
      precio_base: 200.00
    },
    {
      id: '55555555-5555-5555-5555-222222222222',
      especialidad_id: '44444444-4444-4444-4444-222222222222',
      codigo: 'SRV-PED01',
      nombre: 'Control Pediátrico Integral',
      duracion_estimada_minutos: 45,
      precio_base: 300.00
    }
  ],
  personas: [
    {
      id: '66666666-6666-6666-6666-111111111111',
      tipo_documento: 'DPI',
      numero_documento: '1984203940101',
      primer_nombre: 'Carlos',
      primer_apellido: 'Mendoza',
      fecha_nacimiento: '1982-05-14',
      sexo: 'MASCULINO',
      telefono: '5511-2233',
      correo: 'dr.mendoza@redsalud.gt'
    },
    {
      id: '66666666-6666-6666-6666-222222222222',
      tipo_documento: 'DPI',
      numero_documento: '2837192830101',
      primer_nombre: 'Juan',
      primer_apellido: 'Pérez',
      fecha_nacimiento: '1995-11-20',
      sexo: 'MASCULINO',
      telefono: '4422-9988',
      correo: 'juan.perez@gmail.com'
    },
    {
      id: '66666666-6666-6666-6666-333333333333',
      tipo_documento: 'DPI',
      numero_documento: '3029182390101',
      primer_nombre: 'Ana',
      primer_apellido: 'Gómez',
      fecha_nacimiento: '1990-08-12',
      sexo: 'FEMENINO',
      telefono: '5599-8877',
      correo: 'recepcion@redsalud.gt'
    },
    {
      id: '66666666-6666-6666-6666-444444444444',
      tipo_documento: 'DPI',
      numero_documento: '1029384750101',
      primer_nombre: 'Miguel',
      primer_apellido: 'Donis',
      fecha_nacimiento: '1998-03-25',
      sexo: 'MASCULINO',
      telefono: '5500-1122',
      correo: 'admin@clinica.com'
    }
  ],
  empleados: [
    {
      id: '77777777-7777-7777-7777-111111111111',
      persona_id: '66666666-6666-6666-6666-111111111111',
      codigo_empleado: 'EMP-001',
      puesto: 'Médico General Titular'
    }
  ],
  profesionales: [
    {
      id: '88888888-8888-8888-8888-111111111111',
      empleado_id: '77777777-7777-7777-7777-111111111111',
      persona_id: '66666666-6666-6666-6666-111111111111',
      nombre: 'Dr. Carlos Mendoza',
      numero_colegiado: 'COL-12480',
      especialidad: 'Medicina General'
    }
  ],
  pacientes: [
    {
      id: '99999999-9999-9999-9999-111111111111',
      persona_id: '66666666-6666-6666-6666-222222222222',
      codigo_paciente: 'PAC-2026-0001',
      nombre_completo: 'Juan Pérez',
      documento: '2837192830101',
      tipo_sangre: 'O+',
      telefono: '4422-9988',
      correo: 'juan.perez@gmail.com',
      contacto_emergencia: 'María Gómez (4422-9989)'
    }
  ],
  expedientes: [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-111111111111',
      paciente_id: '99999999-9999-9999-9999-111111111111',
      numero_expediente: 'EXP-2026-0001',
      antecedentes_patologicos: 'Hipertensión arterial controlada',
      antecedentes_alergias: 'Alérgico a la penicilina',
      antecedentes_familiares: 'Padre con diabetes mellitus tipo 2',
      consultas: [
        {
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-111111111111',
          fecha_atencion: '2026-02-10T10:30:00Z',
          profesional_nombre: 'Dr. Carlos Mendoza',
          motivo_consulta: 'Cefalea persistente y mareo leve',
          signos_vitales: {
            presion: '125/80',
            frecuencia_cardiaca: 72,
            temperatura: 36.6,
            peso_kg: 74.5,
            talla_cm: 172
          },
          diagnosticos: [
            {
              codigo_cie10: 'G44.2',
              descripcion: 'Cefalea tensional crónica',
              tipo: 'DEFINITIVO'
            }
          ],
          tratamiento: [
            {
              medicamento: 'Paracetamol 500mg',
              dosis: '1 tableta',
              frecuencia: 'Cada 8 horas por 5 días',
              duracion_dias: 5
            }
          ],
          notas_evolucion: 'Paciente consciente, orientado. Se recomienda control de estrés e hidratación adecuada.'
        }
      ]
    }
  ],
  citas: [
    {
      id: 'cccccccc-cccc-cccc-cccc-111111111111',
      paciente_id: '99999999-9999-9999-9999-111111111111',
      paciente_nombre: 'Juan Pérez',
      profesional_id: '88888888-8888-8888-8888-111111111111',
      profesional_nombre: 'Dr. Carlos Mendoza',
      sede_id: '22222222-2222-2222-2222-222222222222',
      sede_nombre: 'Sede Zona 10 (Central)',
      servicio_id: '55555555-5555-5555-5555-111111111111',
      servicio_nombre: 'Consulta Medicina General',
      fecha_inicio: new Date(Date.now() + 86400000).toISOString(),
      fecha_fin: new Date(Date.now() + 86400000 + 1800000).toISOString(),
      duracion_minutos: 30,
      estado: 'PROGRAMADA',
      motivo: 'Control médico periódico de rutina'
    }
  ],
  consultas: [],
  usuarios: [
    {
      id: 'dddddddd-dddd-dddd-dddd-111111111111',
      correo: 'admin@clinica.com',
      password_hash: '$2a$10$wN9iL6b1/vA4/a4hYw0n1OMx3v7vW1I5zR1cT/x.gYwM6P1Z3F.kS', // admin123
      usuario: 'admin',
      nombreCompleto: 'Miguel Donis (Admin)',
      rol: 'ADMIN',
      personaId: '66666666-6666-6666-6666-444444444444',
      sedesAutorizadas: ['22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-333333333333']
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-222222222222',
      correo: 'dr.mendoza@redsalud.gt',
      password_hash: '$2a$10$wN9iL6b1/vA4/a4hYw0n1OMx3v7vW1I5zR1cT/x.gYwM6P1Z3F.kS', // medico123
      usuario: 'dr.mendoza',
      nombreCompleto: 'Dr. Carlos Mendoza',
      rol: 'MEDICO',
      personaId: '66666666-6666-6666-6666-111111111111',
      profesionalId: '88888888-8888-8888-8888-111111111111',
      sedesAutorizadas: ['22222222-2222-2222-2222-222222222222']
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-333333333333',
      correo: 'recepcion@redsalud.gt',
      password_hash: '$2a$10$wN9iL6b1/vA4/a4hYw0n1OMx3v7vW1I5zR1cT/x.gYwM6P1Z3F.kS', // recep123
      usuario: 'recepcion',
      nombreCompleto: 'Ana Gómez (Recepción)',
      rol: 'RECEPCIONISTA',
      personaId: '66666666-6666-6666-6666-333333333333',
      sedesAutorizadas: ['22222222-2222-2222-2222-222222222222']
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-444444444444',
      correo: 'juan.perez@gmail.com',
      password_hash: '$2a$10$wN9iL6b1/vA4/a4hYw0n1OMx3v7vW1I5zR1cT/x.gYwM6P1Z3F.kS', // paciente123
      usuario: 'juan.perez',
      nombreCompleto: 'Juan Pérez (Paciente)',
      rol: 'PACIENTE',
      personaId: '66666666-6666-6666-6666-222222222222',
      pacienteId: '99999999-9999-9999-9999-111111111111'
    }
  ],
  auditoria: [
    {
      id: 'eeeeeeee-eeee-eeee-eeee-111111111111',
      tabla: 'cita',
      registro_id: 'cccccccc-cccc-cccc-cccc-111111111111',
      accion: 'INSERT',
      usuario_nombre: 'Ana Gómez (Recepción)',
      fecha_accion: new Date().toISOString(),
      detalles: 'Cita programada para Juan Pérez con Dr. Carlos Mendoza'
    }
  ]
};
