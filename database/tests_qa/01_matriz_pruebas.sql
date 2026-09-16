-- =============================================================================
-- BATERÍA DE PRUEBAS AUTOMATIZADA: MATRIZ DE CALIDAD SQA
-- Demostración de evidencia técnica para Aseguramiento de Calidad (ISO/IEC 25010)
-- Ejecuta los casos QA-01 a QA-10 y reporta el cumplimiento de cada regla.
-- =============================================================================

CREATE TABLE IF NOT EXISTS resultado_pruebas_qa (
    id_prueba VARCHAR(10) PRIMARY KEY,
    tecnica VARCHAR(50) NOT NULL,
    descripcion_caso TEXT NOT NULL,
    resultado_esperado VARCHAR(30) NOT NULL,
    resultado_obtenido VARCHAR(30) NOT NULL,
    estado_test VARCHAR(15) NOT NULL -- 'PASSED' o 'FAILED'
);

TRUNCATE TABLE resultado_pruebas_qa;

DO $$
DECLARE
    v_paciente_id UUID;
    v_profesional_id UUID;
    v_sede_id UUID;
    v_servicio_id UUID;
    v_cita_test_id UUID;
    v_error_capturado BOOLEAN;
BEGIN
    -- Obtener entidades de prueba desde los datos semilla
    SELECT id INTO v_paciente_id FROM paciente LIMIT 1;
    SELECT id INTO v_profesional_id FROM profesional_salud LIMIT 1;
    SELECT id INTO v_sede_id FROM sede LIMIT 1;
    SELECT id INTO v_servicio_id FROM servicio LIMIT 1;

    -- =========================================================================
    -- QA-01: CONDICIÓN DE BORDE (Límite Inferior - 1) -> Duración = 14 min
    -- Regla: CHECK (duracion_minutos BETWEEN 15 AND 120)
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES (v_paciente_id, v_profesional_id, v_sede_id, v_servicio_id, NOW(), NOW() + INTERVAL '14 minutes', 14, 'PROGRAMADA', 'Test QA-01');
    EXCEPTION WHEN check_violation THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-01', 'Condición de Borde', 'Duración de cita = 14 minutos (límite inferior - 1)',
        'Rechazar (Violación CHECK)',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-02: CONDICIÓN DE BORDE (Límite Inferior Exacto) -> Duración = 15 min
    -- Esperado: ACEPTAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES (v_paciente_id, v_profesional_id, v_sede_id, v_servicio_id, NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 15 minutes', 15, 'PROGRAMADA', 'Test QA-02')
        RETURNING id INTO v_cita_test_id;
    EXCEPTION WHEN OTHERS THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-02', 'Condición de Borde', 'Duración de cita = 15 minutos (límite inferior válido)',
        'Aceptar e Insertar',
        CASE WHEN NOT v_error_capturado THEN 'Aceptado e Insertado' ELSE 'Error al insertar' END,
        CASE WHEN NOT v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-03: PRUEBA DE OBLIGATORIEDAD (Nullability) -> paciente_id = NULL
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES (NULL, v_profesional_id, v_sede_id, v_servicio_id, NOW(), NOW() + INTERVAL '30 minutes', 30, 'PROGRAMADA', 'Test QA-03');
    EXCEPTION WHEN not_null_violation THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-03', 'Obligatoriedad', 'paciente_id con valor NULL en cita',
        'Rechazar (NOT NULL violation)',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-04: PRUEBA DE DOMINIO -> estado = 'FINAL_X'
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES (v_paciente_id, v_profesional_id, v_sede_id, v_servicio_id, NOW(), NOW() + INTERVAL '30 minutes', 30, 'FINAL_X', 'Test QA-04');
    EXCEPTION WHEN check_violation THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-04', 'Prueba de Dominio', 'estado = "FINAL_X" fuera del dominio permitido',
        'Rechazar (CHECK violation)',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-05: INTEGRIDAD REFERENCIAL -> Paciente UUID Inexistente
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID, v_profesional_id, v_sede_id, v_servicio_id, NOW(), NOW() + INTERVAL '30 minutes', 30, 'PROGRAMADA', 'Test QA-05');
    EXCEPTION WHEN foreign_key_violation THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-05', 'Integridad Referencial', 'paciente_id con UUID inexistente en base de datos',
        'Rechazar (FK violation)',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-06: COHERENCIA TEMPORAL -> fecha_fin < fecha_inicio
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES (v_paciente_id, v_profesional_id, v_sede_id, v_servicio_id, NOW() + INTERVAL '1 hour', NOW(), 30, 'PROGRAMADA', 'Test QA-06');
    EXCEPTION WHEN check_violation THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-06', 'Relación entre Datos', 'fecha_fin anterior a fecha_inicio en cita',
        'Rechazar (CHECK fecha_fin > fecha_inicio)',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-07: CONDICIÓN DE BORDE SUPERIOR -> Duración = 121 min
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES (v_paciente_id, v_profesional_id, v_sede_id, v_servicio_id, NOW(), NOW() + INTERVAL '121 minutes', 121, 'PROGRAMADA', 'Test QA-07');
    EXCEPTION WHEN check_violation THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-07', 'Condición de Borde', 'Duración de cita = 121 minutos (límite superior + 1)',
        'Rechazar (CHECK violation)',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-08: UNICIDAD DE EXPEDIENTE 1:1 -> Duplicar expediente al mismo paciente
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        INSERT INTO expediente_clinico (paciente_id, numero_expediente)
        VALUES (v_paciente_id, 'EXP-TEST-DUPLICADO');
    EXCEPTION WHEN unique_violation THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-08', 'Unicidad 1:1', 'Crear segundo expediente para un mismo paciente existente',
        'Rechazar (UNIQUE violation)',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-09: REGLA DE NEGOCIO RN-02 -> Traslape de Horarios para un mismo Profesional
    -- Esperado: RECHAZAR
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        -- Intentar agendar exactamente a la misma hora de la cita QA-02 que se insertó antes
        INSERT INTO cita (paciente_id, profesional_id, sede_id, servicio_id, fecha_inicio, fecha_fin, duracion_minutos, estado, motivo)
        VALUES (v_paciente_id, v_profesional_id, v_sede_id, v_servicio_id, NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 15 minutes', 15, 'PROGRAMADA', 'Test Traslape');
    EXCEPTION WHEN check_violation, OTHERS THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-09', 'Lógica de Conflicto', 'Superposición o traslape de horario en cita activa para un médico',
        'Rechazar por conflicto horario',
        CASE WHEN v_error_capturado THEN 'Rechazado correctamente' ELSE 'Aceptado indebidamente' END,
        CASE WHEN v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

    -- =========================================================================
    -- QA-10: TRAZABILIDAD Y AUDITORÍA -> Trigger registra actualización
    -- Esperado: Registro generado en tabla auditoria
    -- =========================================================================
    v_error_capturado := false;
    BEGIN
        UPDATE cita SET estado = 'CONFIRMADA' WHERE id = v_cita_test_id;
        IF NOT EXISTS (SELECT 1 FROM auditoria WHERE registro_id = v_cita_test_id AND accion = 'UPDATE') THEN
            v_error_capturado := true;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_error_capturado := true;
    END;

    INSERT INTO resultado_pruebas_qa VALUES (
        'QA-10', 'Trazabilidad y Auditoría', 'Disparo automático de trigger al modificar cita',
        'Registro insertado en auditoria',
        CASE WHEN NOT v_error_capturado THEN 'Auditoría registrada' ELSE 'Fallo en auditoría' END,
        CASE WHEN NOT v_error_capturado THEN 'PASSED' ELSE 'FAILED' END
    );

END;
$$;

-- Mostrar el reporte de resultados finales de SQA
SELECT 
    id_prueba AS "ID",
    tecnica AS "Técnica Evaluada",
    descripcion_caso AS "Condición de Entrada",
    resultado_esperado AS "Resultado Esperado",
    resultado_obtenido AS "Resultado Obtenido",
    estado_test AS "Dictamen Final"
FROM resultado_pruebas_qa
ORDER BY id_prueba;
