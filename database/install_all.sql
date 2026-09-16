-- =============================================================================
-- SCRIPT MAESTRO: INSTALACIÓN COMPLETA DE BASE DE DATOS
-- Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico
-- Fase 1: Universidad Mariano Gálvez - Aseguramiento de Calidad de Software
-- =============================================================================
-- Instrucciones:
-- 1. Abre este archivo en tu editor favorito.
-- 2. Copia todo su contenido.
-- 3. Pégalo en el SQL Editor de tu proyecto en Supabase (o en pgAdmin/psql).
-- 4. Haz clic en "Run" / "Ejecutar".
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONES
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. ESTRUCTURA ORGANIZACIONAL
-- -----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_clinica_organizacion ON clinica(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_sede_clinica ON sede(clinica_id);
CREATE INDEX IF NOT EXISTS idx_area_sede ON area(sede_id);

-- -----------------------------------------------------------------------------
-- 3. CATÁLOGOS MAESTROS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS especialidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    CONSTRAINT chk_servicio_duracion CHECK (duracion_estimada_minutos BETWEEN 15 AND 120),
    CONSTRAINT chk_servicio_precio CHECK (precio_base >= 0)
);

CREATE TABLE IF NOT EXISTS sede_servicio (
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE CASCADE,
    servicio_id UUID NOT NULL REFERENCES servicio(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (sede_id, servicio_id)
);

CREATE INDEX IF NOT EXISTS idx_servicio_especialidad ON servicio(especialidad_id);

-- -----------------------------------------------------------------------------
-- 4. IDENTIDAD Y PERSONAL
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento VARCHAR(20) NOT NULL,
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
    CONSTRAINT uq_persona_documento UNIQUE (tipo_documento, numero_documento),
    CONSTRAINT chk_persona_sexo CHECK (sexo IN ('MASCULINO', 'FEMENINO', 'OTRO')),
    CONSTRAINT chk_persona_fecha_nacimiento CHECK (fecha_nacimiento <= CURRENT_DATE)
);

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

CREATE TABLE IF NOT EXISTS profesional_salud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleado(id) ON DELETE RESTRICT,
    numero_colegiado VARCHAR(40) NOT NULL UNIQUE,
    firma_digital_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_profesional_empleado UNIQUE (empleado_id)
);

CREATE TABLE IF NOT EXISTS profesional_especialidad (
    profesional_id UUID NOT NULL REFERENCES profesional_salud(id) ON DELETE CASCADE,
    especialidad_id UUID NOT NULL REFERENCES especialidad(id) ON DELETE RESTRICT,
    es_principal BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (profesional_id, especialidad_id)
);

CREATE TABLE IF NOT EXISTS empleado_sede (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleado(id) ON DELETE CASCADE,
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE RESTRICT,
    area_id UUID REFERENCES area(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_empleado_sede_area UNIQUE (empleado_id, sede_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_documento ON persona(numero_documento);
CREATE INDEX IF NOT EXISTS idx_paciente_persona ON paciente(persona_id);
CREATE INDEX IF NOT EXISTS idx_empleado_persona ON empleado(persona_id);
CREATE INDEX IF NOT EXISTS idx_profesional_empleado ON profesional_salud(empleado_id);

-- -----------------------------------------------------------------------------
-- 5. SEGURIDAD Y CONTROL DE ACCESO (RBAC + ÁMBITO)
-- -----------------------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS rol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permiso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(60) NOT NULL UNIQUE,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rol_permiso (
    rol_id UUID NOT NULL REFERENCES rol(id) ON DELETE CASCADE,
    permiso_id UUID NOT NULL REFERENCES permiso(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS usuario_rol (
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES rol(id) ON DELETE CASCADE,
    asignado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE IF NOT EXISTS usuario_asignacion_ambito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE CASCADE,
    area_id UUID REFERENCES area(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_sede_area UNIQUE (usuario_id, sede_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_persona ON usuario(persona_id);
CREATE INDEX IF NOT EXISTS idx_usuario_ambito_sede ON usuario_asignacion_ambito(usuario_id, sede_id);

-- -----------------------------------------------------------------------------
-- 6. MÓDULO CLÍNICO
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expediente_clinico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    numero_expediente VARCHAR(40) NOT NULL UNIQUE,
    antecedentes_patologicos TEXT,
    antecedentes_quirurgicos TEXT,
    antecedentes_alergias TEXT,
    antecedentes_familiares TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_expediente_paciente UNIQUE (paciente_id)
);

CREATE TABLE IF NOT EXISTS cita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    profesional_id UUID NOT NULL REFERENCES profesional_salud(id) ON DELETE RESTRICT,
    sede_id UUID NOT NULL REFERENCES sede(id) ON DELETE RESTRICT,
    servicio_id UUID NOT NULL REFERENCES servicio(id) ON DELETE RESTRICT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    estado VARCHAR(25) NOT NULL DEFAULT 'PROGRAMADA',
    motivo TEXT NOT NULL,
    observaciones TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cita_fechas_coherentes CHECK (fecha_fin > fecha_inicio),
    CONSTRAINT chk_cita_duracion_borde CHECK (duracion_minutos BETWEEN 15 AND 120),
    CONSTRAINT chk_cita_estado_dominio CHECK (
        estado IN ('PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'REPROGRAMADA', 'NO_ASISTIO')
    )
);

CREATE OR REPLACE FUNCTION fn_validar_traslape_citas()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado IN ('PROGRAMADA', 'CONFIRMADA') THEN
        IF EXISTS (
            SELECT 1 FROM cita
            WHERE profesional_id = NEW.profesional_id
              AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
              AND estado IN ('PROGRAMADA', 'CONFIRMADA')
              AND (
                  (NEW.fecha_inicio >= fecha_inicio AND NEW.fecha_inicio < fecha_fin) OR
                  (NEW.fecha_fin > fecha_inicio AND NEW.fecha_fin <= fecha_fin) OR
                  (NEW.fecha_inicio <= fecha_inicio AND NEW.fecha_fin >= fecha_fin)
              )
        ) THEN
            RAISE EXCEPTION 'Conflicto de horario: El profesional ya cuenta con una cita activa en ese intervalo de tiempo.'
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_traslape_citas ON cita;
CREATE TRIGGER trg_validar_traslape_citas
BEFORE INSERT OR UPDATE OF fecha_inicio, fecha_fin, profesional_id, estado ON cita
FOR EACH ROW
EXECUTE FUNCTION fn_validar_traslape_citas();

CREATE TABLE IF NOT EXISTS consulta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID NOT NULL REFERENCES expediente_clinico(id) ON DELETE RESTRICT,
    cita_id UUID REFERENCES cita(id) ON DELETE SET NULL,
    profesional_id UUID NOT NULL REFERENCES profesional_salud(id) ON DELETE RESTRICT,
    fecha_atencion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    motivo_consulta TEXT NOT NULL,
    examen_fisico TEXT,
    presion_arterial VARCHAR(20),
    frecuencia_cardiaca INTEGER,
    temperatura_celsius NUMERIC(4, 1),
    peso_kg NUMERIC(5, 2),
    talla_cm NUMERIC(5, 1),
    notas_evolucion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diagnostico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    codigo_cie10 VARCHAR(20),
    descripcion TEXT NOT NULL,
    tipo VARCHAR(25) NOT NULL DEFAULT 'PRESUNTIVO',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_diagnostico_tipo CHECK (tipo IN ('PRESUNTIVO', 'DEFINITIVO'))
);

CREATE TABLE IF NOT EXISTS tratamiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    medicamento VARCHAR(150) NOT NULL,
    dosis VARCHAR(80) NOT NULL,
    frecuencia VARCHAR(80) NOT NULL,
    duracion_dias INTEGER NOT NULL,
    instrucciones_adicionales TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tratamiento_duracion CHECK (duracion_dias > 0)
);

CREATE INDEX IF NOT EXISTS idx_cita_paciente ON cita(paciente_id);
CREATE INDEX IF NOT EXISTS idx_cita_profesional_fecha ON cita(profesional_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_consulta_expediente ON consulta(expediente_id);
CREATE INDEX IF NOT EXISTS idx_diagnostico_consulta ON diagnostico(consulta_id);
CREATE INDEX IF NOT EXISTS idx_tratamiento_consulta ON tratamiento(consulta_id);

-- -----------------------------------------------------------------------------
-- 7. AUDITORÍA Y TRAZABILIDAD
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla VARCHAR(60) NOT NULL,
    registro_id UUID NOT NULL,
    accion VARCHAR(15) NOT NULL,
    usuario_id UUID,
    datos_previos JSONB,
    datos_nuevos JSONB,
    fecha_accion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_auditoria_accion CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON auditoria(tabla, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_accion);

CREATE OR REPLACE FUNCTION fn_auditoria_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_registro_id UUID;
    v_datos_previos JSONB := NULL;
    v_datos_nuevos JSONB := NULL;
    v_accion VARCHAR(15);
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_accion := 'INSERT';
        v_registro_id := NEW.id;
        v_datos_nuevos := to_jsonb(NEW);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_accion := 'UPDATE';
        v_registro_id := NEW.id;
        v_datos_previos := to_jsonb(OLD);
        v_datos_nuevos := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        v_accion := 'DELETE';
        v_registro_id := OLD.id;
        v_datos_previos := to_jsonb(OLD);
    END IF;

    INSERT INTO auditoria (
        tabla,
        registro_id,
        accion,
        datos_previos,
        datos_nuevos,
        fecha_accion
    ) VALUES (
        TG_TABLE_NAME,
        v_registro_id,
        v_accion,
        v_datos_previos,
        v_datos_nuevos,
        NOW()
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditoria_cita ON cita;
CREATE TRIGGER trg_auditoria_cita
AFTER INSERT OR UPDATE OR DELETE ON cita
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_trigger();

DROP TRIGGER IF EXISTS trg_auditoria_expediente ON expediente_clinico;
CREATE TRIGGER trg_auditoria_expediente
AFTER INSERT OR UPDATE OR DELETE ON expediente_clinico
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_trigger();

DROP TRIGGER IF EXISTS trg_auditoria_consulta ON consulta;
CREATE TRIGGER trg_auditoria_consulta
AFTER INSERT OR UPDATE OR DELETE ON consulta
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_trigger();

DROP TRIGGER IF EXISTS trg_auditoria_paciente ON paciente;
CREATE TRIGGER trg_auditoria_paciente
AFTER INSERT OR UPDATE OR DELETE ON paciente
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_trigger();

COMMIT;
