export interface RegistroInput {
  nombre_completo: string;
  correo: string;
  contrasena: string;
  confirmar_contrasena: string;
  fecha_nacimiento: string;
  numero_documento?: string;
  telefono?: string;
  sexo?: string;
  tipo_sangre?: string;
  terminos_aceptados?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    nombre_completo: string;
    primer_nombre: string;
    primer_apellido: string;
    correo: string;
    contrasena: string;
    fecha_nacimiento: string;
    numero_documento: string;
    telefono: string;
    sexo: 'MASCULINO' | 'FEMENINO' | 'OTRO';
    tipo_sangre: string;
    usuario: string;
    edad: number;
  };
}

/**
 * Validador profesional de registro con técnicas de Aseguramiento de Calidad (SQA)
 * Bajo norma ISO/IEC 25010 (Adecuación Funcional, Fiabilidad, Seguridad).
 * Aplica:
 * - Análisis de Valores de Borde (BVA)
 * - Pruebas de Dominio
 * - Pruebas de Obligatoriedad (Nullability)
 * - Coherencia Lógica y Biográfica
 */
export function validarRegistroUsuario(data: Partial<RegistroInput>): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. OBLIGATORIEDAD Y BORDE: Nombre Completo
  const nombreRaw = (data.nombre_completo || '').trim();
  if (!nombreRaw) {
    errors.nombre_completo = 'El nombre completo es obligatorio (QA-REQ-01).';
  } else if (nombreRaw.length < 3) {
    errors.nombre_completo = 'El nombre es demasiado corto. Mínimo 3 caracteres (QA-BVA-MIN).';
  } else if (nombreRaw.length > 100) {
    errors.nombre_completo = 'El nombre no puede exceder 100 caracteres (QA-BVA-MAX).';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/.test(nombreRaw)) {
    errors.nombre_completo = 'El nombre contiene caracteres especiales o dígitos no permitidos (QA-DOM-01).';
  }

  // 2. OBLIGATORIEDAD, FORMATO Y SINTAXIS: Correo Electrónico
  const correoRaw = (data.correo || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!correoRaw) {
    errors.correo = 'El correo electrónico es obligatorio (QA-REQ-02).';
  } else if (correoRaw.length > 100) {
    errors.correo = 'El correo electrónico no puede exceder 100 caracteres (QA-BVA-MAX).';
  } else if (!emailRegex.test(correoRaw)) {
    errors.correo = 'El formato del correo electrónico no es válido según estándar RFC 5322 (QA-SYN-01).';
  }

  // 3. SEGURIDAD Y BORDE: Contraseña
  const contrasena = data.contrasena || '';
  if (!contrasena) {
    errors.contrasena = 'La contraseña es obligatoria (QA-REQ-03).';
  } else if (contrasena.length < 8) {
    errors.contrasena = 'La contraseña debe tener al menos 8 caracteres (QA-BVA-MIN8).';
  } else if (contrasena.length > 64) {
    errors.contrasena = 'La contraseña no puede exceder 64 caracteres (QA-BVA-MAX64).';
  } else {
    // Reglas de robustez de seguridad
    const tieneMayuscula = /[A-Z]/.test(contrasena);
    const tieneMinuscula = /[a-z]/.test(contrasena);
    const tieneNumero = /[0-9]/.test(contrasena);

    if (!tieneMayuscula || !tieneMinuscula || !tieneNumero) {
      errors.contrasena = 'La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número (QA-SEC-01).';
    }
  }

  // 4. INTEGRIDAD REFERENCIAL Y COINCIDENCIA: Confirmar Contraseña
  const confirmar = data.confirmar_contrasena || '';
  if (!confirmar) {
    errors.confirmar_contrasena = 'Debe confirmar su contraseña (QA-REQ-04).';
  } else if (contrasena !== confirmar) {
    errors.confirmar_contrasena = 'Las contraseñas no coinciden (QA-INT-01).';
  }

  // 5. COHERENCIA BIOGRÁFICA Y TEMPORAL: Fecha de Nacimiento
  let edadCalculada = 0;
  const fechaNacRaw = (data.fecha_nacimiento || '').trim();
  if (!fechaNacRaw) {
    errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria (QA-REQ-05).';
  } else {
    const fechaNac = new Date(fechaNacRaw + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (isNaN(fechaNac.getTime())) {
      errors.fecha_nacimiento = 'Formato de fecha inválido. Utilice AAAA-MM-DD (QA-SYN-02).';
    } else if (fechaNac >= hoy) {
      errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser hoy ni una fecha futura (QA-TMP-01).';
    } else {
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      edadCalculada = edad;

      if (edad < 0) {
        errors.fecha_nacimiento = 'Edad cronológica inválida (QA-TMP-02).';
      } else if (edad > 120) {
        errors.fecha_nacimiento = 'La edad calculada supera el límite biográfico admitido de 120 años (QA-BVA-AGE120).';
      }
    }
  }

  // 6. DOMINIO Y SINTAXIS: Documento de Identificación (DPI)
  let documentoLimpio = (data.numero_documento || '').replace(/\D/g, '');
  if (data.numero_documento && data.numero_documento.trim() !== '') {
    if (documentoLimpio.length !== 13 && (data.numero_documento.trim().length < 6 || data.numero_documento.trim().length > 20)) {
      errors.numero_documento = 'El DPI guatemalteco debe contener exactamente 13 dígitos numéricos (o entre 6 y 20 caracteres para pasaportes extranjeros) (QA-DOM-DPI).';
    }
  }
  if (!documentoLimpio && (!data.numero_documento || !data.numero_documento.trim())) {
    // Generación por defecto si se omitió
    documentoLimpio = 'DPI' + Math.floor(1000000000000 + Math.random() * 9000000000000);
  }

  // 7. FORMATO TELEFÓNICO: Teléfono
  let telefonoLimpio = (data.telefono || '').replace(/\s+/g, '');
  if (telefonoLimpio) {
    const telefonoDigitos = telefonoLimpio.replace(/\D/g, '');
    if (telefonoDigitos.length < 8 || telefonoDigitos.length > 15) {
      errors.telefono = 'El teléfono debe contener entre 8 y 15 dígitos numéricos (QA-SYN-TEL).';
    }
  } else {
    telefonoLimpio = 'No especificado';
  }

  // 8. PRUEBA DE DOMINIO CERRADO: Sexo / Género
  const sexosValidos = ['MASCULINO', 'FEMENINO', 'OTRO'];
  const sexoUpper = (data.sexo || 'OTRO').toUpperCase().trim();
  if (data.sexo && !sexosValidos.includes(sexoUpper)) {
    errors.sexo = `El sexo seleccionado no pertenece al dominio clínico admitido (${sexosValidos.join(', ')}) (QA-DOM-SEX).`;
  }

  // 9. PRUEBA DE DOMINIO: Tipo de Sangre
  const tiposSangreValidos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'DESCONOCIDO'];
  const tipoSangreUpper = (data.tipo_sangre || 'O+').toUpperCase().trim();
  if (data.tipo_sangre && !tiposSangreValidos.includes(tipoSangreUpper)) {
    errors.tipo_sangre = `El tipo de sangre no es válido (${tiposSangreValidos.join(', ')}) (QA-DOM-BLD).`;
  }

  // 10. TÉRMINOS Y CONSENTIMIENTO INFORMADO (Auditoría SQA / Ley de Datos en Salud)
  if (data.terminos_aceptados !== undefined && data.terminos_aceptados !== true) {
    errors.terminos_aceptados = 'Debe aceptar los términos de uso y política de privacidad clínica para registrarse (QA-LEG-01).';
  }

  // Partir nombre para personas
  const partes = nombreRaw.split(/\s+/);
  const primerNombre = partes[0] || 'Usuario';
  const primerApellido = partes.slice(1).join(' ') || 'Registrado';

  // Generar sugerencia de nombre de usuario limpio
  const baseUser = (primerNombre.toLowerCase() + '.' + (partes[1] || 'paciente').toLowerCase())
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]/g, '');

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: isValid ? {
      nombre_completo: nombreRaw,
      primer_nombre: primerNombre,
      primer_apellido: primerApellido,
      correo: correoRaw,
      contrasena,
      fecha_nacimiento: fechaNacRaw,
      numero_documento: data.numero_documento?.trim() || documentoLimpio,
      telefono: telefonoLimpio,
      sexo: (sexosValidos.includes(sexoUpper) ? sexoUpper : 'OTRO') as 'MASCULINO' | 'FEMENINO' | 'OTRO',
      tipo_sangre: tiposSangreValidos.includes(tipoSangreUpper) ? tipoSangreUpper : 'O+',
      usuario: baseUser,
      edad: edadCalculada,
    } : undefined,
  };
}
