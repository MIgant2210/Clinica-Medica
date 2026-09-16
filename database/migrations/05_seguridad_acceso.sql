-- =============================================================================
-- MIGRACIÓN 05: SEGURIDAD Y CONTROL DE ACCESO (RBAC + ÁMBITO)
-- Tablas: usuario, rol, permiso, rol_permiso, usuario_rol, usuario_asignacion_ambito
-- =============================================================================

-- 1. Cuenta de Usuario del Sistema
CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES persona(id) ON DELETE RESTRICT,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    ultimo_acceso TIMESTAMPTZ,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_persona UNIQUE (persona_id)
);

-- 2. Rol
CREATE TABLE IF NOT EXISTS rol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) NOT NULL UNIQUE, -- 'ADMIN', 'MEDICO', 'RECEPCIONISTA', 'ENFERMERO'
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Permiso Atómico
CREATE TABLE IF NOT EXISTS permiso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(60) NOT NULL UNIQUE, -- 'cita:crear', 'expediente:consultar', etc.
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Asignación Rol - Permiso (N:M)
CREATE TABLE IF NOT EXISTS rol_permiso (
    rol_id UUID NOT NULL REFERENCES rol(id) ON DELETE CASCADE,
    permiso_id UUID NOT NULL REFERENCES permiso(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (rol_id, permiso_id)
);

-- 5. Asignación Usuario - Rol (N:M)
CREATE TABLE IF NOT EXISTS usuario_rol (
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES rol(id) ON DELETE CASCADE,
    asignado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, rol_id)
);

-- 6. Ámbito de Acceso Organizacional del Usuario (Scope)
CREATE TABLE IF NOT EXISTS usuario_asignacion_ambito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE CASCADE,
    area_id UUID REFERENCES area(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_sede_area UNIQUE (usuario_id, sede_id, area_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuario_persona ON usuario(persona_id);
CREATE INDEX IF NOT EXISTS idx_usuario_ambito_sede ON usuario_asignacion_ambito(usuario_id, sede_id);
