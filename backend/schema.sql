-- Habilitar extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sede
CREATE TABLE IF NOT EXISTS sedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT NOT NULL,
  telefono VARCHAR(50) NOT NULL
);

-- 2. Área
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  piso_ubicacion VARCHAR(100)
);

-- 3. Especialidad
CREATE TABLE IF NOT EXISTS especialidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);

-- 4. Servicio
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  especialidad_id UUID NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  duracion_estimada_minutos INT NOT NULL,
  precio_base DECIMAL(10, 2) NOT NULL
);

-- 5. Persona (Entidad base para Pacientes, Empleados, Usuarios)
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_documento VARCHAR(20) NOT NULL,
  numero_documento VARCHAR(50) UNIQUE NOT NULL,
  primer_nombre VARCHAR(100) NOT NULL,
  primer_apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  sexo VARCHAR(20) NOT NULL,
  telefono VARCHAR(50),
  correo VARCHAR(100)
);

-- 6. Empleado
CREATE TABLE IF NOT EXISTS empleados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  codigo_empleado VARCHAR(50) UNIQUE NOT NULL,
  puesto VARCHAR(100) NOT NULL
);

-- 7. Profesional (Médicos, Enfermeros, etc.)
CREATE TABLE IF NOT EXISTS profesionales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  numero_colegiado VARCHAR(50),
  especialidad VARCHAR(100)
);

-- 8. Paciente
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  codigo_paciente VARCHAR(50) UNIQUE NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  tipo_sangre VARCHAR(10),
  telefono VARCHAR(50),
  correo VARCHAR(100),
  contacto_emergencia TEXT
);

-- 9. Expediente Clínico
CREATE TABLE IF NOT EXISTS expedientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  numero_expediente VARCHAR(50) UNIQUE NOT NULL,
  antecedentes_patologicos TEXT,
  antecedentes_alergias TEXT,
  antecedentes_familiares TEXT
);

-- 10. Citas
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  paciente_nombre VARCHAR(200) NOT NULL,
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  profesional_nombre VARCHAR(200) NOT NULL,
  sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  sede_nombre VARCHAR(100) NOT NULL,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  servicio_nombre VARCHAR(150) NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  duracion_minutos INT NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'PROGRAMADA',
  motivo TEXT
);

-- 11. Consultas Clínicas (Atenciones en el expediente)
CREATE TABLE IF NOT EXISTS consultas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  fecha_atencion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  profesional_nombre VARCHAR(200) NOT NULL,
  motivo_consulta TEXT NOT NULL,
  signos_vitales JSONB,
  diagnosticos JSONB,
  tratamiento JSONB,
  notas_evolucion TEXT
);

-- 12. Usuarios del Sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correo VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  profesional_id UUID REFERENCES profesionales(id) ON DELETE SET NULL,
  sedes_autorizadas JSONB
);

-- 13. Auditoría (Bitácora)
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla VARCHAR(50) NOT NULL,
  registro_id UUID NOT NULL,
  accion VARCHAR(50) NOT NULL,
  usuario_nombre VARCHAR(200) NOT NULL,
  fecha_accion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detalles TEXT
);
