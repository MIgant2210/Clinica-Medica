-- =============================================================================
-- MIGRACIÓN 06: MÓDULO CLÍNICO Y ATENCIÓN MÉDICA
-- Tablas: expediente_clinico, cita, consulta, diagnostico, tratamiento
-- Incluye reglas de negocio de aseguramiento de calidad (QA-01 a QA-06)
-- =============================================================================

-- 1. Expediente Clínico Único (Relación 1:1 con Paciente)
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
    -- Regla QA-08: Un paciente solo puede tener un expediente clínico en todo el sistema
    CONSTRAINT uq_expediente_paciente UNIQUE (paciente_id)
);

-- 2. Cita Médica
CREATE TABLE IF NOT EXISTS cita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Reglas QA-03 y QA-05: Paciente obligatorio y con clave foránea válida
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

    -- QA-06: Coherencia temporal (fecha de fin mayor a fecha de inicio)
    CONSTRAINT chk_cita_fechas_coherentes CHECK (fecha_fin > fecha_inicio),

    -- QA-01 y QA-02: Condición de borde en duración (mínimo 15 min, máximo 120 min)
    CONSTRAINT chk_cita_duracion_borde CHECK (duracion_minutos BETWEEN 15 AND 120),

    -- QA-04: Dominio de estados válidos
    CONSTRAINT chk_cita_estado_dominio CHECK (
        estado IN ('PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'REPROGRAMADA', 'NO_ASISTIO')
    )
);

-- Función y Trigger para RN-02: Prevenir traslape de citas activas para un mismo profesional
CREATE OR REPLACE FUNCTION fn_validar_traslape_citas()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo verificar conflictos para estados activos de citas
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

-- 3. Consulta / Atención Médica Realizada
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

-- 4. Diagnóstico Clínico
CREATE TABLE IF NOT EXISTS diagnostico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    codigo_cie10 VARCHAR(20),
    descripcion TEXT NOT NULL,
    tipo VARCHAR(25) NOT NULL DEFAULT 'PRESUNTIVO',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_diagnostico_tipo CHECK (tipo IN ('PRESUNTIVO', 'DEFINITIVO'))
);

-- 5. Tratamiento / Prescripción Médica
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

-- Índices de optimización de consultas
CREATE INDEX IF NOT EXISTS idx_cita_paciente ON cita(paciente_id);
CREATE INDEX IF NOT EXISTS idx_cita_profesional_fecha ON cita(profesional_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_consulta_expediente ON consulta(expediente_id);
CREATE INDEX IF NOT EXISTS idx_diagnostico_consulta ON diagnostico(consulta_id);
CREATE INDEX IF NOT EXISTS idx_tratamiento_consulta ON tratamiento(consulta_id);
