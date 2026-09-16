-- =============================================================================
-- MIGRACIÓN 04: IDENTIDAD Y PERSONAL
-- Tablas: persona, paciente, empleado, profesional_salud, profesional_especialidad, empleado_sede
-- =============================================================================

-- 1. Persona (Entidad central de datos biográficos)
CREATE TABLE IF NOT EXISTS persona (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento VARCHAR(20) NOT NULL, -- DPI, PASAPORTE, PARTIDA_NACIMIENTO
    numero_documento VARCHAR(50) NOT NULL,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    fecha_nacimiento DATE NOT NULL,
    sexo VARCHAR(15) NOT NULL,
    telefono VARCHAR(25),
    correo VARCHAR(100),
    direccion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Restricciones de integridad y calidad
    CONSTRAINT uq_persona_documento UNIQUE (tipo_documento, numero_documento),
    CONSTRAINT chk_persona_sexo CHECK (sexo IN ('MASCULINO', 'FEMENINO', 'OTRO')),
    CONSTRAINT chk_persona_fecha_nacimiento CHECK (fecha_nacimiento <= CURRENT_DATE)
);

-- 2. Paciente (Rol asistencial vinculado a una persona)
CREATE TABLE IF NOT EXISTS paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES persona(id) ON DELETE RESTRICT,
    codigo_paciente VARCHAR(30) NOT NULL UNIQUE,
    tipo_sangre VARCHAR(10),
    contacto_emergencia_nombre VARCHAR(120),
    contacto_emergencia_telefono VARCHAR(25),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_paciente_persona UNIQUE (persona_id)
);

-- 3. Empleado (Rol laboral vinculado a una persona)
CREATE TABLE IF NOT EXISTS empleado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES persona(id) ON DELETE RESTRICT,
    codigo_empleado VARCHAR(30) NOT NULL UNIQUE,
    puesto VARCHAR(80) NOT NULL,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_empleado_persona UNIQUE (persona_id)
);

-- 4. Profesional de la Salud (Extensión especializada del empleado)
CREATE TABLE IF NOT EXISTS profesional_salud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleado(id) ON DELETE RESTRICT,
    numero_colegiado VARCHAR(40) NOT NULL UNIQUE,
    firma_digital_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_profesional_empleado UNIQUE (empleado_id)
);

-- 5. Profesional y sus Especialidades (Relación N:M)
CREATE TABLE IF NOT EXISTS profesional_especialidad (
    profesional_id UUID NOT NULL REFERENCES profesional_salud(id) ON DELETE CASCADE,
    especialidad_id UUID NOT NULL REFERENCES especialidad(id) ON DELETE RESTRICT,
    es_principal BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (profesional_id, especialidad_id)
);

-- 6. Asignación de Empleados a Sedes y Áreas
CREATE TABLE IF NOT EXISTS empleado_sede (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleado(id) ON DELETE CASCADE,
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE RESTRICT,
    area_id UUID REFERENCES area(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_empleado_sede_area UNIQUE (empleado_id, sede_id, area_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_persona_documento ON persona(numero_documento);
CREATE INDEX IF NOT EXISTS idx_paciente_persona ON paciente(persona_id);
CREATE INDEX IF NOT EXISTS idx_empleado_persona ON empleado(persona_id);
CREATE INDEX IF NOT EXISTS idx_profesional_empleado ON profesional_salud(empleado_id);
