-- =============================================================================
-- MIGRACIÓN 03: CATÁLOGOS MAESTROS Y REUTILIZABLES
-- Tablas: especialidad, servicio, sede_servicio
-- =============================================================================

-- 1. Especialidades Médicas
CREATE TABLE IF NOT EXISTS especialidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Servicios de Salud
CREATE TABLE IF NOT EXISTS servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    especialidad_id UUID REFERENCES especialidad(id) ON DELETE SET NULL,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    duracion_estimada_minutos INTEGER NOT NULL DEFAULT 30,
    precio_base NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Restricción de calidad de borde: duración estimada de atención médica
    CONSTRAINT chk_servicio_duracion CHECK (duracion_estimada_minutos BETWEEN 15 AND 120),
    CONSTRAINT chk_servicio_precio CHECK (precio_base >= 0)
);

-- 3. Asignación de Servicios a Sedes (Mapeo Flexible)
CREATE TABLE IF NOT EXISTS sede_servicio (
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE CASCADE,
    servicio_id UUID NOT NULL REFERENCES servicio(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (sede_id, servicio_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_servicio_especialidad ON servicio(especialidad_id);
