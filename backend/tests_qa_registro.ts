/**
 * BATERÍA DE PRUEBAS DE ASEGURAMIENTO DE CALIDAD DE SOFTWARE (SQA)
 * 
 * Proyecto: Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico
 * Curso: Aseguramiento de Calidad de Software - Universidad Mariano Gálvez
 * Marco Normativo: ISO/IEC 25010 (Adecuación Funcional, Fiabilidad, Seguridad)
 * 
 * Técnicas aplicadas:
 * - Análisis de Valores de Borde (Boundary Value Analysis - BVA)
 * - Pruebas de Dominio (Domain Testing)
 * - Pruebas de Obligatoriedad (Nullability Testing)
 * - Pruebas de Integridad Referencial y Coherencia Temporal
 */

import { validarRegistroUsuario } from './src/modules/auth/auth.validator';
import { pool } from './src/config/db';

interface TestCase {
  id: string;
  tecnica: string;
  descripcion: string;
  entrada: any;
  resultadoEsperado: 'RECHAZAR' | 'ACEPTAR';
  campoEsperadoConError?: string;
}

const suitePruebas: TestCase[] = [
  // 1. OBLIGATORIEDAD (NULLABILITY)
  {
    id: 'QA-REG-01',
    tecnica: 'Obligatoriedad (NOT NULL)',
    descripcion: 'Rechazo de registro con nombre completo vacío',
    entrada: {
      nombre_completo: '',
      correo: 'paciente.test@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1995-04-12',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'nombre_completo',
  },
  {
    id: 'QA-REG-02',
    tecnica: 'Obligatoriedad (NOT NULL)',
    descripcion: 'Rechazo de registro con correo nulo o no provisto',
    entrada: {
      nombre_completo: 'Mariana López',
      correo: '',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1995-04-12',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'correo',
  },
  {
    id: 'QA-REG-03',
    tecnica: 'Obligatoriedad (NOT NULL)',
    descripcion: 'Rechazo de registro con fecha de nacimiento vacía',
    entrada: {
      nombre_completo: 'Mariana López',
      correo: 'mariana@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'fecha_nacimiento',
  },

  // 2. ANÁLISIS DE VALORES DE BORDE (BVA)
  {
    id: 'QA-REG-04',
    tecnica: 'BVA (Límite Inferior - 1)',
    descripcion: 'Rechazo de nombre con 2 caracteres (límite inferior no alcanzado: min 3)',
    entrada: {
      nombre_completo: 'Al',
      correo: 'al@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1995-04-12',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'nombre_completo',
  },
  {
    id: 'QA-REG-05',
    tecnica: 'BVA (Límite Inferior Válido)',
    descripcion: 'Aceptación de nombre en el límite inferior exacto (3 caracteres: "Ana")',
    entrada: {
      nombre_completo: 'Ana',
      correo: 'ana.test@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1998-06-20',
      sexo: 'FEMENINO',
    },
    resultadoEsperado: 'ACEPTAR',
  },
  {
    id: 'QA-REG-06',
    tecnica: 'BVA (Límite Inferior - 1 Contraseña)',
    descripcion: 'Rechazo de contraseña de 7 caracteres (límite mínimo es 8)',
    entrada: {
      nombre_completo: 'Carlos Mendoza',
      correo: 'carlos@salud.gt',
      contrasena: 'Pass12!',
      confirmar_contrasena: 'Pass12!',
      fecha_nacimiento: '1990-01-01',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'contrasena',
  },
  {
    id: 'QA-REG-07',
    tecnica: 'BVA (Límite Inferior Válido Contraseña)',
    descripcion: 'Aceptación de contraseña de 8 caracteres con complejidad completa',
    entrada: {
      nombre_completo: 'Carlos Mendoza',
      correo: 'carlos.mendoza@salud.gt',
      contrasena: 'Passw123',
      confirmar_contrasena: 'Passw123',
      fecha_nacimiento: '1990-01-01',
      sexo: 'MASCULINO',
    },
    resultadoEsperado: 'ACEPTAR',
  },
  {
    id: 'QA-REG-08',
    tecnica: 'BVA (Límite Biográfico Máximo + 1)',
    descripcion: 'Rechazo de fecha de nacimiento con edad superior a 120 años (año 1890)',
    entrada: {
      nombre_completo: 'Persona Longeva',
      correo: 'longevo@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1890-01-01',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'fecha_nacimiento',
  },

  // 3. SEGURIDAD ISO 25010 (COMPLEJIDAD DE CONTRASEÑA)
  {
    id: 'QA-REG-09',
    tecnica: 'Seguridad / Robustez',
    descripcion: 'Rechazo de contraseña sin letras mayúsculas',
    entrada: {
      nombre_completo: 'Laura Méndez',
      correo: 'laura@salud.gt',
      contrasena: 'password123',
      confirmar_contrasena: 'password123',
      fecha_nacimiento: '1992-03-15',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'contrasena',
  },
  {
    id: 'QA-REG-10',
    tecnica: 'Seguridad / Robustez',
    descripcion: 'Rechazo de contraseña sin números',
    entrada: {
      nombre_completo: 'Laura Méndez',
      correo: 'laura@salud.gt',
      contrasena: 'PasswordSinNum',
      confirmar_contrasena: 'PasswordSinNum',
      fecha_nacimiento: '1992-03-15',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'contrasena',
  },

  // 4. INTEGRIDAD REFERENCIAL DE CONTRASEÑA
  {
    id: 'QA-REG-11',
    tecnica: 'Integridad de Confirmación',
    descripcion: 'Rechazo cuando confirmar_contrasena no coincide con contrasena',
    entrada: {
      nombre_completo: 'Mario Bros',
      correo: 'mario@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica9999!',
      fecha_nacimiento: '1985-09-13',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'confirmar_contrasena',
  },

  // 5. COHERENCIA TEMPORAL Y BIOGRÁFICA
  {
    id: 'QA-REG-12',
    tecnica: 'Coherencia Temporal (Fecha Futura)',
    descripcion: 'Rechazo de fecha de nacimiento en el futuro (ej. mañana o 2030)',
    entrada: {
      nombre_completo: 'Viajero Tiempo',
      correo: 'viajero@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '2030-01-01',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'fecha_nacimiento',
  },

  // 6. PRUEBA DE DOMINIO Y SINTAXIS
  {
    id: 'QA-REG-13',
    tecnica: 'Sintaxis de Correo RFC 5322',
    descripcion: 'Rechazo de dirección de correo sin arroba o sin dominio',
    entrada: {
      nombre_completo: 'Juan Test',
      correo: 'correoinvalido.sinarroba.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1996-08-25',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'correo',
  },
  {
    id: 'QA-REG-14',
    tecnica: 'Prueba de Dominio (Sexo Clínico)',
    descripcion: 'Rechazo de valor no admitido en el dominio sexo clínico ("ALIEN")',
    entrada: {
      nombre_completo: 'Juan Test',
      correo: 'juan.test@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1996-08-25',
      sexo: 'ALIEN',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'sexo',
  },
  {
    id: 'QA-REG-15',
    tecnica: 'Prueba de Dominio (DPI Guatemalteco)',
    descripcion: 'Rechazo de DPI con longitud errónea (ej. 5 dígitos en vez de 13)',
    entrada: {
      nombre_completo: 'Juan Test',
      correo: 'juan.test@salud.gt',
      contrasena: 'Clinica2026!',
      confirmar_contrasena: 'Clinica2026!',
      fecha_nacimiento: '1996-08-25',
      numero_documento: '12345',
    },
    resultadoEsperado: 'RECHAZAR',
    campoEsperadoConError: 'numero_documento',
  },

  // 7. CASO INTEGRAL VÁLIDO (HAPPY PATH)
  {
    id: 'QA-REG-16',
    tecnica: 'Adecuación Funcional Integral',
    descripcion: 'Aceptación de registro completo con todos los datos clínicos validados',
    entrada: {
      nombre_completo: 'Beatriz Adriana Fuentes',
      correo: 'beatriz.fuentes@correo.com',
      contrasena: 'SaludGuatemala2026*',
      confirmar_contrasena: 'SaludGuatemala2026*',
      fecha_nacimiento: '1997-11-23',
      numero_documento: '2987162530101',
      telefono: '5566-7788',
      sexo: 'FEMENINO',
      tipo_sangre: 'O+',
      terminos_aceptados: true,
    },
    resultadoEsperado: 'ACEPTAR',
  },
];

async function ejecutarBateriaSQA() {
  console.log('========================================================================');
  console.log('🩺 INFORME TÉCNICO DE EJECUCIÓN DE PRUEBAS DE CALIDAD (SQA)');
  console.log('Norma ISO/IEC 25010 - Módulo de Registro Autónomo de Usuarios y Pacientes');
  console.log('Universidad Mariano Gálvez de Guatemala - Aseguramiento de Calidad');
  console.log('========================================================================\n');

  let aprobadas = 0;
  let reprobadas = 0;

  for (const prueba of suitePruebas) {
    const res = validarRegistroUsuario(prueba.entrada);
    let pasoPrueba = false;
    let mensajeDetalle = '';

    if (prueba.resultadoEsperado === 'RECHAZAR') {
      const fueRechazado = !res.isValid;
      const campoTieneError = prueba.campoEsperadoConError ? Boolean(res.errors[prueba.campoEsperadoConError]) : true;

      if (fueRechazado && campoTieneError) {
        pasoPrueba = true;
        mensajeDetalle = `Rechazado con éxito -> Error: "${res.errors[prueba.campoEsperadoConError!]}"`;
      } else {
        mensajeDetalle = `FALLO: Esperaba rechazar campo '${prueba.campoEsperadoConError}', pero resultado fue: ${JSON.stringify(res.errors)}`;
      }
    } else {
      if (res.isValid) {
        pasoPrueba = true;
        mensajeDetalle = `Aceptado con éxito -> Usuario: ${res.sanitized?.usuario}, Edad: ${res.sanitized?.edad} años`;
      } else {
        mensajeDetalle = `FALLO: Se esperaba aceptación pero hubo errores: ${JSON.stringify(res.errors)}`;
      }
    }

    if (pasoPrueba) {
      aprobadas++;
      console.log(`✅ [${prueba.id}] PASSED | ${prueba.tecnica.padEnd(30)} | ${prueba.descripcion}`);
      console.log(`   └─ Evidencia: ${mensajeDetalle}`);
    } else {
      reprobadas++;
      console.error(`❌ [${prueba.id}] FAILED | ${prueba.tecnica.padEnd(30)} | ${prueba.descripcion}`);
      console.error(`   └─ Motivo: ${mensajeDetalle}`);
    }
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`RESUMEN SQA: ${aprobadas} Aprobadas, ${reprobadas} Reprobadas de ${suitePruebas.length} pruebas.`);
  console.log(`Porcentaje de Calidad y Cobertura: ${((aprobadas / suitePruebas.length) * 100).toFixed(1)}%`);
  console.log('------------------------------------------------------------------------\n');

  if (reprobadas > 0) {
    process.exit(1);
  }
}

ejecutarBateriaSQA();
