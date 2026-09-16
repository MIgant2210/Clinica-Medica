-- =============================================================================
-- MIGRACIÓN 07: AUDITORÍA Y TRAZABILIDAD TRANSVERSAL
-- Tabla: auditoria, función y triggers automáticos
-- Cumple con RF-08 y la característica de Seguridad de ISO/IEC 25010
-- =============================================================================

-- 1. Tabla de Auditoría Inmutable
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla VARCHAR(60) NOT NULL,
    registro_id UUID NOT NULL,
    accion VARCHAR(15) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    usuario_id UUID,             -- Identificador de usuario o sistema
    datos_previos JSONB,
    datos_nuevos JSONB,
    fecha_accion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_auditoria_accion CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON auditoria(tabla, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_accion);

-- 2. Función Trigger Genérica de Auditoría
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

-- 3. Asignación de Triggers de Auditoría en Tablas Críticas
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
