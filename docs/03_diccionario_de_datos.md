# 03 - Diccionario de Datos del Sistema

**Proyecto**: Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico  
**Base de Datos**: PostgreSQL 15+ / Supabase  
**Convención de Nombres**: `snake_case`, llaves primarias tipo `UUID`, llaves foráneas con sufijo `_id`.

---

## 1. Módulo Organizacional

### 1.1. Tabla: `organizacion`
Representa a la persona jurídica o corporativa propietaria de la red médica.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único.
* `codigo` (VARCHAR(30), UNIQUE, NOT NULL): Código visible o abreviatura comercial.
* `nombre` (VARCHAR(150), NOT NULL): Nombre legal o comercial.
* `numero_tributario` (VARCHAR(50)): NIT o registro fiscal.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado de vigencia.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Fecha de registro.

### 1.2. Tabla: `clinica`
Unidad médica asistencial adscrita a una organización.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único.
* `organizacion_id` (UUID, FK -> `organizacion(id)`, NOT NULL): Organización matriz.
* `codigo` (VARCHAR(30), NOT NULL): Código único interno.
* `nombre` (VARCHAR(150), NOT NULL): Nombre de la clínica.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado de vigencia.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Fecha de creación.
* *Restricción*: `UNIQUE(organizacion_id, codigo)`

### 1.3. Tabla: `sede`
Instalación física o sucursal donde se prestan servicios de salud.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único.
* `clinica_id` (UUID, FK -> `clinica(id)`, NOT NULL): Clínica a la que pertenece.
* `codigo` (VARCHAR(30), NOT NULL): Código de la sede (ej. SEDE-NORTE).
* `nombre` (VARCHAR(150), NOT NULL): Nombre descriptivo.
* `direccion` (TEXT, NOT NULL): Dirección física de la sede.
* `telefono` (VARCHAR(30)): Teléfono de contacto de recepción.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado de vigencia.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Fecha de creación.
* *Restricción*: `UNIQUE(clinica_id, codigo)`

### 1.4. Tabla: `area`
Subdivisión funcional u operativa dentro de una sede.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único.
* `sede_id` (UUID, FK -> `sede(id)`, NOT NULL): Sede en la que se ubica.
* `nombre` (VARCHAR(100), NOT NULL): Nombre del área (ej. Consulta Externa, Sala A).
* `piso_ubicacion` (VARCHAR(50)): Referencia de ubicación física.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado de vigencia.

---

## 2. Módulo de Catálogos Maestros

### 2.1. Tabla: `especialidad`
Especialidades médicas disponibles (ej. Pediatría, Medicina Interna, Traumatología).
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único.
* `codigo` (VARCHAR(30), UNIQUE, NOT NULL): Código estándar.
* `nombre` (VARCHAR(100), NOT NULL): Denominación de la especialidad.
* `descripcion` (TEXT): Alcance y descripción clínica.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado.

### 2.2. Tabla: `servicio`
Catálogo de servicios de atención médica ofrecidos.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único.
* `codigo` (VARCHAR(30), UNIQUE, NOT NULL): Código de servicio.
* `especialidad_id` (UUID, FK -> `especialidad(id)`, NULL): Especialidad vinculada.
* `nombre` (VARCHAR(150), NOT NULL): Nombre del servicio (ej. Consulta General, Curación Menor).
* `duracion_estimada_minutos` (INTEGER, NOT NULL, Default: 30): Duración sugerida.
* `precio_base` (NUMERIC(10,2), NOT NULL, Default: 0.00): Precio referencial.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado.
* *Restricción*: `CHECK (duracion_estimada_minutos BETWEEN 15 AND 120)`

---

## 3. Módulo de Identidad y Personal

### 3.1. Tabla: `persona`
Registro único central de datos biográficos.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único global.
* `tipo_documento` (VARCHAR(20), NOT NULL): DPI, Pasaporte, Partida, etc.
* `numero_documento` (VARCHAR(50), NOT NULL): Número de documento.
* `primer_nombre` (VARCHAR(50), NOT NULL): Primer nombre.
* `segundo_nombre` (VARCHAR(50)): Segundo nombre.
* `primer_apellido` (VARCHAR(50), NOT NULL): Primer apellido.
* `segundo_apellido` (VARCHAR(50)): Segundo apellido.
* `fecha_nacimiento` (DATE, NOT NULL): Fecha de natalicio.
* `sexo` (VARCHAR(15), NOT NULL): MASCULINO, FEMENINO, OTRO.
* `telefono` (VARCHAR(25)): Teléfono celular / fijo.
* `correo` (VARCHAR(100)): Correo electrónico personal.
* `direccion` (TEXT): Domicilio de residencia.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Fecha de alta.
* *Restricciones*: 
  * `UNIQUE(tipo_documento, numero_documento)`
  * `CHECK (sexo IN ('MASCULINO', 'FEMENINO', 'OTRO'))`
  * `CHECK (fecha_nacimiento <= CURRENT_DATE)`

### 3.2. Tabla: `paciente`
Asocia la identidad de una persona con su rol asistencial.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador de paciente.
* `persona_id` (UUID, FK -> `persona(id)`, UNIQUE, NOT NULL): Persona vinculada.
* `codigo_paciente` (VARCHAR(30), UNIQUE, NOT NULL): Código visible (ej. PAC-0001).
* `tipo_sangre` (VARCHAR(10)): Grupo sanguíneo (A+, O+, etc.).
* `contacto_emergencia_nombre` (VARCHAR(120)): Nombre contacto de urgencia.
* `contacto_emergencia_telefono` (VARCHAR(25)): Teléfono de urgencia.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Registro.

### 3.3. Tabla: `empleado`
Modela el vínculo laboral con la institución.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador de empleado.
* `persona_id` (UUID, FK -> `persona(id)`, UNIQUE, NOT NULL): Persona vinculada.
* `codigo_empleado` (VARCHAR(30), UNIQUE, NOT NULL): Código laboral.
* `puesto` (VARCHAR(80), NOT NULL): Denominación del cargo.
* `fecha_ingreso` (DATE, NOT NULL, Default: `CURRENT_DATE`): Inicio de labores.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado laboral.

### 3.4. Tabla: `profesional_salud`
Extensión para personal facultado para atención médica.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador profesional.
* `empleado_id` (UUID, FK -> `empleado(id)`, UNIQUE, NOT NULL): Empleado vinculado.
* `numero_colegiado` (VARCHAR(40), UNIQUE, NOT NULL): Número de registro o colegiado médico.
* `firma_digital_url` (TEXT): Ruta o referencia de firma digital autorizada.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado activo.

### 3.5. Tabla: `profesional_especialidad`
Relación N:M entre profesional de salud y especialidades.
* `profesional_id` (UUID, FK -> `profesional_salud(id)`, NOT NULL): Profesional.
* `especialidad_id` (UUID, FK -> `especialidad(id)`, NOT NULL): Especialidad avalada.
* `es_principal` (BOOLEAN, NOT NULL, Default: `false`): Si es su especialidad primaria.
* *PK Compuesta*: `PRIMARY KEY(profesional_id, especialidad_id)`

---

## 4. Módulo de Seguridad y Control de Acceso (RBAC)

### 4.1. Tabla: `usuario`
Cuenta de acceso autenticada vinculada a una persona.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador de cuenta.
* `persona_id` (UUID, FK -> `persona(id)`, UNIQUE, NOT NULL): Persona titular.
* `nombre_usuario` (VARCHAR(50), UNIQUE, NOT NULL): Username de login.
* `correo` (VARCHAR(100), UNIQUE, NOT NULL): Correo de autenticación.
* `password_hash` (TEXT, NOT NULL): Clave cifrada (`crypt()` o hash Supabase).
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado de la cuenta.
* `ultimo_acceso` (TIMESTAMPTZ): Registro de último inicio de sesión.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Fecha de registro.

### 4.2. Tabla: `rol`
Definición de roles organizacionales.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador de rol.
* `codigo` (VARCHAR(30), UNIQUE, NOT NULL): ej. `ADMIN`, `MEDICO`, `RECEPCIONISTA`.
* `nombre` (VARCHAR(80), NOT NULL): Nombre del rol.
* `descripcion` (TEXT): Explicación de responsabilidades.

### 4.3. Tabla: `permiso`
Acciones atómicas autorizables.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador.
* `codigo` (VARCHAR(60), UNIQUE, NOT NULL): ej. `cita:crear`, `expediente:ver`.
* `modulo` (VARCHAR(50), NOT NULL): Módulo al que pertenece.
* `descripcion` (TEXT): Descripción del permiso.

### 4.4. Tablas Intermedias de Acceso:
* `rol_permiso`: Asigna permisos a un rol (`PRIMARY KEY(rol_id, permiso_id)`).
* `usuario_rol`: Asigna roles a un usuario (`PRIMARY KEY(usuario_id, rol_id)`).
* `usuario_asignacion_ambito`: Controla el ámbito territorial/operativo del usuario:
  * `id` (UUID, PK, Default: `gen_random_uuid()`)
  * `usuario_id` (UUID, FK -> `usuario(id)`, NOT NULL)
  * `sede_id` (UUID, FK -> `sede(id)`, NOT NULL)
  * `area_id` (UUID, FK -> `area(id)`, NULL)
  * `activo` (BOOLEAN, NOT NULL, Default: `true`)
  * *Restricción*: `UNIQUE(usuario_id, sede_id, area_id)`

---

## 5. Módulo Clínico

### 5.1. Tabla: `expediente_clinico`
Historial único del paciente (Relación 1:1 con `paciente`).
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único.
* `paciente_id` (UUID, FK -> `paciente(id)`, UNIQUE, NOT NULL): Paciente titular.
* `numero_expediente` (VARCHAR(40), UNIQUE, NOT NULL): Código visible (ej. EXP-2026-0001).
* `antecedentes_patologicos` (TEXT): Historial patológico personal.
* `antecedentes_quirurgicos` (TEXT): Historial quirúrgico.
* `antecedentes_alergias` (TEXT): Alergias medicamentosas/ambientales.
* `antecedentes_familiares` (TEXT): Cargas hereditarias.
* `activo` (BOOLEAN, NOT NULL, Default: `true`): Estado del expediente.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Apertura del expediente.

### 5.2. Tabla: `cita`
Programación de atenciones médicas.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador único de la cita.
* `paciente_id` (UUID, FK -> `paciente(id)`, NOT NULL): Paciente citado.
* `profesional_id` (UUID, FK -> `profesional_salud(id)`, NOT NULL): Profesional asignado.
* `sede_id` (UUID, FK -> `sede(id)`, NOT NULL): Sede de atención.
* `servicio_id` (UUID, FK -> `servicio(id)`, NOT NULL): Servicio a prestar.
* `fecha_inicio` (TIMESTAMPTZ, NOT NULL): Inicio de la cita.
* `fecha_fin` (TIMESTAMPTZ, NOT NULL): Fin estimado de la cita.
* `duracion_minutos` (INTEGER, NOT NULL): Minutos de atención programada.
* `estado` (VARCHAR(25), NOT NULL, Default: `'PROGRAMADA'`): PROGRAMADA, CONFIRMADA, ATENDIDA, CANCELADA, REPROGRAMADA, NO_ASISTIO.
* `motivo` (TEXT, NOT NULL): Razón de la consulta.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Fecha de agendamiento.
* *Restricciones de Calidad*:
  * `CHECK (fecha_fin > fecha_inicio)` (QA-06)
  * `CHECK (duracion_minutos BETWEEN 15 AND 120)` (QA-01, QA-02)
  * `CHECK (estado IN ('PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'REPROGRAMADA', 'NO_ASISTIO'))` (QA-04)

### 5.3. Tabla: `consulta`
Acto médico efectuado derivado de una cita o atención espontánea.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador del evento médico.
* `expediente_id` (UUID, FK -> `expediente_clinico(id)`, NOT NULL): Historial asociado.
* `cita_id` (UUID, FK -> `cita(id)`, NULL): Cita previa originaria (opcional).
* `profesional_id` (UUID, FK -> `profesional_salud(id)`, NOT NULL): Profesional autor.
* `fecha_atencion` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Momento de atención.
* `motivo_consulta` (TEXT, NOT NULL): Motivo reportado por el paciente.
* `examen_fisico` (TEXT): Hallazgos del examen clínico.
* `presion_arterial` (VARCHAR(20)): Signo vital (ej. 120/80).
* `frecuencia_cardiaca` (INTEGER): Pulsaciones por minuto.
* `temperatura_celsius` (NUMERIC(4,1)): Temperatura corporal.
* `peso_kg` (NUMERIC(5,2)): Peso del paciente en kilogramos.
* `talla_cm` (NUMERIC(5,1)): Altura del paciente en centímetros.
* `notas_evolucion` (TEXT): Conclusiones y evolución del cuadro.
* `creado_en` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Registro.

### 5.4. Tabla: `diagnostico`
Diagnósticos dictaminados en una consulta.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador.
* `consulta_id` (UUID, FK -> `consulta(id)`, NOT NULL): Consulta de origen.
* `codigo_cie10` (VARCHAR(20)): Código internacional de enfermedad (opcional).
* `descripcion` (TEXT, NOT NULL): Diagnóstico médico.
* `tipo` (VARCHAR(25), NOT NULL, Default: `'PRESUNTIVO'`): PRESUNTIVO, DEFINITIVO.
* *Restricción*: `CHECK (tipo IN ('PRESUNTIVO', 'DEFINITIVO'))`

### 5.5. Tabla: `tratamiento`
Prescripciones e indicaciones terapéuticas.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador.
* `consulta_id` (UUID, FK -> `consulta(id)`, NOT NULL): Consulta de origen.
* `medicamento` (VARCHAR(150), NOT NULL): Nombre del fármaco / indicación.
* `dosis` (VARCHAR(80), NOT NULL): Dosis recetada.
* `frecuencia` (VARCHAR(80), NOT NULL): Intervalo de toma.
* `duracion_dias` (INTEGER, NOT NULL): Días de tratamiento.
* `instrucciones_adicionales` (TEXT): Indicaciones de cuidado.
* *Restricción*: `CHECK (duracion_dias > 0)`

---

## 6. Módulo Transversal: Auditoría y Trazabilidad

### 6.1. Tabla: `auditoria`
Registro inmutable de transacciones críticas.
* `id` (UUID, PK, Default: `gen_random_uuid()`): Identificador de traza.
* `tabla` (VARCHAR(60), NOT NULL): Nombre de la entidad impactada.
* `registro_id` (UUID, NOT NULL): Identificador de la fila afectada.
* `accion` (VARCHAR(15), NOT NULL): INSERT, UPDATE, DELETE.
* `usuario_id` (UUID, NULL): Usuario que ejecutó el cambio.
* `datos_previos` (JSONB, NULL): Estado anterior del registro.
* `datos_nuevos` (JSONB, NULL): Estado posterior del registro.
* `fecha_accion` (TIMESTAMPTZ, NOT NULL, Default: `NOW()`): Fecha y hora exacta UTC.
* *Restricción*: `CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))`
