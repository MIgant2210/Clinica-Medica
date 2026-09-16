-- =============================================================================
-- DATOS SEMILLA (SEED DATA)
-- Población inicial para demostración, desarrollo y ejecución de pruebas
-- =============================================================================

DO $$
DECLARE
    -- Variables para almacenar IDs fijos o generados
    v_org_id UUID;
    v_clinica_id UUID;
    v_sede_central_id UUID;
    v_sede_norte_id UUID;
    v_area_consulta_id UUID;
    
    v_esp_med_general UUID;
    v_esp_pediatria UUID;
    v_esp_cardiologia UUID;
    
    v_srv_consulta_general UUID;
    v_srv_control_pediatrico UUID;
    
    v_persona_medico UUID;
    v_empleado_medico UUID;
    v_profesional_medico UUID;
    
    v_persona_paciente1 UUID;
    v_paciente1_id UUID;
    v_expediente1_id UUID;

    v_rol_admin UUID;
    v_rol_medico UUID;
    v_rol_recepcion UUID;
BEGIN
    -- 1. Organización
    INSERT INTO organizacion (codigo, nombre, numero_tributario, telefono, correo_contacto)
    VALUES ('ORG-SALUD', 'Red de Clínicas y Especialidades Médicas S.A.', '8493021-4', '2200-1100', 'contacto@redsalud.gt')
    ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_org_id;

    -- 2. Clínica
    INSERT INTO clinica (organizacion_id, codigo, nombre)
    VALUES (v_org_id, 'CLN-CENTRAL', 'Centro Médico Integral')
    ON CONFLICT (organizacion_id, codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_clinica_id;

    -- 3. Sedes
    INSERT INTO sede (clinica_id, codigo, nombre, direccion, telefono)
    VALUES (v_clinica_id, 'SEDE-Z10', 'Sede Zona 10', '10ma Calle 3-40 Zona 10, Ciudad de Guatemala', '2200-1101')
    ON CONFLICT (clinica_id, codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_sede_central_id;

    INSERT INTO sede (clinica_id, codigo, nombre, direccion, telefono)
    VALUES (v_clinica_id, 'SEDE-Z01', 'Sede Centro Histórico', '6ta Avenida 4-20 Zona 1, Ciudad de Guatemala', '2200-1102')
    ON CONFLICT (clinica_id, codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_sede_norte_id;

    -- 4. Área
    INSERT INTO area (sede_id, codigo, nombre, piso_ubicacion)
    VALUES (v_sede_central_id, 'AR-EXT', 'Consulta Externa', 'Nivel 2, Módulo A')
    ON CONFLICT (sede_id, codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_area_consulta_id;

    -- 5. Especialidades
    INSERT INTO especialidad (codigo, nombre, descripcion)
    VALUES ('ESP-MG', 'Medicina General', 'Atención médica primaria y preventiva')
    ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_esp_med_general;

    INSERT INTO especialidad (codigo, nombre, descripcion)
    VALUES ('ESP-PED', 'Pediatría', 'Cuidado y salud integral de infantes y adolescentes')
    ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_esp_pediatria;

    INSERT INTO especialidad (codigo, nombre, descripcion)
    VALUES ('ESP-CARD', 'Cardiología', 'Diagnóstico y tratamiento de patologías cardiovasculares')
    ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_esp_cardiologia;

    -- 6. Servicios
    INSERT INTO servicio (especialidad_id, codigo, nombre, duracion_estimada_minutos, precio_base)
    VALUES (v_esp_med_general, 'SRV-CG01', 'Consulta de Medicina General', 30, 200.00)
    ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_srv_consulta_general;

    INSERT INTO servicio (especialidad_id, codigo, nombre, duracion_estimada_minutos, precio_base)
    VALUES (v_esp_pediatria, 'SRV-PED01', 'Control de Niño Sano', 45, 300.00)
    ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_srv_control_pediatrico;

    -- 7. Roles del Sistema
    INSERT INTO rol (codigo, nombre, descripcion)
    VALUES ('ADMIN', 'Administrador del Sistema', 'Acceso global y parametrización de la plataforma')
    ON CONFLICT (codigo) DO NOTHING;

    INSERT INTO rol (codigo, nombre, descripcion)
    VALUES ('MEDICO', 'Personal Clínico / Médico', 'Atención de pacientes, expedientes y consultas')
    ON CONFLICT (codigo) DO NOTHING;

    INSERT INTO rol (codigo, nombre, descripcion)
    VALUES ('RECEPCIONISTA', 'Personal de Recepción', 'Registro de personas, pacientes y programación de citas')
    ON CONFLICT (codigo) DO NOTHING;

    -- 8. Persona Médica (Dr. Carlos Roberto Mendoza)
    INSERT INTO persona (tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo)
    VALUES ('DPI', '1984203940101', 'Carlos', 'Mendoza', '1982-05-14', 'MASCULINO', '5511-2233', 'dr.mendoza@redsalud.gt')
    ON CONFLICT (tipo_documento, numero_documento) DO UPDATE SET primer_nombre = EXCLUDED.primer_nombre
    RETURNING id INTO v_persona_medico;

    -- Empleado Médico
    INSERT INTO empleado (persona_id, codigo_empleado, puesto, fecha_ingreso)
    VALUES (v_persona_medico, 'EMP-001', 'Médico General Titular', '2023-01-15')
    ON CONFLICT (persona_id) DO UPDATE SET codigo_empleado = EXCLUDED.codigo_empleado
    RETURNING id INTO v_empleado_medico;

    -- Profesional de Salud
    INSERT INTO profesional_salud (empleado_id, numero_colegiado)
    VALUES (v_empleado_medico, 'COL-12480')
    ON CONFLICT (empleado_id) DO UPDATE SET numero_colegiado = EXCLUDED.numero_colegiado
    RETURNING id INTO v_profesional_medico;

    -- Vincular Profesional con Especialidad General
    INSERT INTO profesional_especialidad (profesional_id, especialidad_id, es_principal)
    VALUES (v_profesional_medico, v_esp_med_general, true)
    ON CONFLICT (profesional_id, especialidad_id) DO NOTHING;

    -- 9. Persona Paciente (Juan Alberto Pérez Gómez)
    INSERT INTO persona (tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo)
    VALUES ('DPI', '2837192830101', 'Juan', 'Pérez', '1995-11-20', 'MASCULINO', '4422-9988', 'juan.perez@gmail.com')
    ON CONFLICT (tipo_documento, numero_documento) DO UPDATE SET primer_nombre = EXCLUDED.primer_nombre
    RETURNING id INTO v_persona_paciente1;

    -- Paciente
    INSERT INTO paciente (persona_id, codigo_paciente, tipo_sangre, contacto_emergencia_nombre, contacto_emergencia_telefono)
    VALUES (v_persona_paciente1, 'PAC-2026-0001', 'O+', 'María Gómez', '4422-9989')
    ON CONFLICT (persona_id) DO UPDATE SET codigo_paciente = EXCLUDED.codigo_paciente
    RETURNING id INTO v_paciente1_id;

    -- Expediente Clínico del Paciente
    INSERT INTO expediente_clinico (paciente_id, numero_expediente, antecedentes_alergias)
    VALUES (v_paciente1_id, 'EXP-2026-0001', 'Alérgico a la penicilina')
    ON CONFLICT (paciente_id) DO UPDATE SET numero_expediente = EXCLUDED.numero_expediente
    RETURNING id INTO v_expediente1_id;

    -- 10. Cita Médica de Demostración
    INSERT INTO cita (
        paciente_id,
        profesional_id,
        sede_id,
        servicio_id,
        fecha_inicio,
        fecha_fin,
        duracion_minutos,
        estado,
        motivo
    ) VALUES (
        v_paciente1_id,
        v_profesional_medico,
        v_sede_central_id,
        v_srv_consulta_general,
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
        30,
        'PROGRAMADA',
        'Chequeo médico preventivo y control de presión'
    );

    RAISE NOTICE 'Datos semilla inicializados exitosamente.';
END;
$$;
