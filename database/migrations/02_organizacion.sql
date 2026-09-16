-- =============================================================================
-- MIGRACIÓN 02: ESTRUCTURA ORGANIZACIONAL
-- Tablas: organizacion, clinica, sede, area
-- =============================================================================

-- 1. Organización (Entidad Corporativa / Propietaria)
CREATE TABLE IF NOT EXISTS organizacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    numero_tributario VARCHAR(50),
    telefono VARCHAR(30),
    correo_contacto VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Clínica (Unidad Médica adscrita a una Organización)
CREATE TABLE IF NOT EXISTS clinica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizacion(id) ON DELETE RESTRICT,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_clinica_org_codigo UNIQUE(organizacion_id, codigo)
);

-- 3. Sede (Ubicación física o sucursal de atención)
CREATE TABLE IF NOT EXISTS sede (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL REFERENCES clinica(id) ON DELETE RESTRICT,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(30),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sede_clinica_codigo UNIQUE(clinica_id, codigo)
);

-- 4. Área (Área operativa o funcional dentro de una Sede)
CREATE TABLE IF NOT EXISTS area (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE RESTRICT,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    piso_ubicacion VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_area_sede_codigo UNIQUE(sede_id, codigo)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_clinica_organizacion ON clinica(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_sede_clinica ON sede(clinica_id);
CREATE INDEX IF NOT EXISTS idx_area_sede ON area(sede_id);
