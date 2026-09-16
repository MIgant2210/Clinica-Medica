# Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico

> **Proyecto Académico**: Aseguramiento de Calidad de Software  
> **Universidad**: Universidad Mariano Gálvez de Guatemala  
> **Fase 1**: Estructura principal, arquitectura de datos y aseguramiento de calidad (SQA)  
> **Repositorio Oficial**: [https://github.com/MIgant2210/Clinica-Medica](https://github.com/MIgant2210/Clinica-Medica)

---

## 1. Visión General del Proyecto

Plataforma integral diseñada para centralizar, organizar y asegurar la trazabilidad de los procesos operativos y asistenciales de una clínica médica:
* **Identidad Centralizada**: Modelo de `persona` única que separa la identidad civil del rol de `paciente`, `empleado` o `usuario`.
* **Escalabilidad Multisede**: Representación desacoplada de Organizaciones, Clínicas, Sedes físicas y Áreas de atención.
* **Seguridad Robusta (RBAC + Ámbito)**: Control de acceso basado en roles restringido geográficamente por sedes y áreas autorizadas.
* **Calidad Basada en ISO/IEC 25010**: Validación técnica de reglas de negocio a nivel de motor de base de datos (PostgreSQL / Supabase) con trazabilidad y auditoría transversal inmutable.

```
Paciente Único ──> Citas ──> Atención Médica ──> Expediente Clínico ──> Diagnóstico / Tratamiento
```

---

## 2. Estructura del Repositorio

```text
Clinica-Medica/
├── .env.example                         # Plantilla de variables de entorno para la base de datos
├── .gitignore                           # Exclusión de archivos locales y credenciales sensibles
├── README.md                            # Documentación general y guía de puesta en marcha
│
├── docs/                                # Documentación formal de análisis y calidad
│   ├── 01_analisis_y_requisitos.md      # Requisitos Funcionales (RF-01 a RF-09), RNF y Reglas de Negocio
│   ├── 02_modelo_organizacional_y_arquitectura.md # Arquitectura por capas y modelo RBAC con ámbito
│   ├── 03_diccionario_de_datos.md       # Diccionario técnico de tablas, columnas, UUIDs y constraints
│   └── 04_plan_aseguramiento_calidad_sqa.md # Plan de calidad ISO 25010 y Matriz de Pruebas (QA-01 a QA-10)
│
└── database/                            # Infraestructura como Código (PostgreSQL / Supabase)
    ├── migrations/                      # Scripts DDL modulares en orden de dependencia
    │   ├── 01_extensiones.sql           # uuid-ossp, pgcrypto
    │   ├── 02_organizacion.sql          # organizacion, clinica, sede, area
    │   ├── 03_catalogos.sql             # especialidad, servicio, sede_servicio
    │   ├── 04_identidad_personal.sql    # persona, paciente, empleado, profesional_salud
    │   ├── 05_seguridad_acceso.sql      # usuario, rol, permiso, roles y ámbito
    │   ├── 06_clinico.sql               # expediente, cita, consulta, diagnóstico, tratamiento
    │   └── 07_auditoria.sql             # auditoria transversal y triggers automáticos
    ├── seeds/
    │   └── 01_datos_semilla.sql         # Datos iniciales para pruebas (sedes, doctores, pacientes, citas)
    ├── tests_qa/
    │   └── 01_matriz_pruebas.sql        # Suite de pruebas automatizada en SQL con reporte PASSED/FAILED
    └── install_all.sql                  # Script maestro consolidado para instalación en un solo clic
```

---

## 3. Despliegue en Base de Datos (Cuando tengan las credenciales)

No se requiere instalar librerías complejas. La base de datos puede desplegarse en **Supabase** o en cualquier servidor **PostgreSQL 15+**:

### Paso A: Creación de la Estructura (DDL)
1. Inicia sesión en tu proyecto en [Supabase](https://supabase.com).
2. Ve a la sección **SQL Editor**.
3. Abre el archivo `database/install_all.sql`, copia su contenido, pégalo en el editor y haz clic en **Run**.

### Paso B: Carga de Datos Iniciales (Seed Data)
1. En el mismo SQL Editor de Supabase, abre y ejecuta el archivo:
   ```text
   database/seeds/01_datos_semilla.sql
   ```
2. Esto creará la organización de prueba, dos sedes, médicos, un paciente registrado y una cita médica.

### Paso C: Ejecución de la Matriz de Pruebas de Calidad (SQA)
1. Para validar y generar las evidencias técnicas de aseguramiento de calidad, abre y ejecuta:
   ```text
   database/tests_qa/01_matriz_pruebas.sql
   ```
2. La consola devolverá una tabla con el dictamen de cada caso (todos deben reportar **PASSED**):
   * **QA-01**: Borde duración = 14 min $\rightarrow$ *Rechazado correctamente*.
   * **QA-02**: Borde duración = 15 min $\rightarrow$ *Aceptado e Insertado*.
   * **QA-03**: Obligatoriedad paciente nulo $\rightarrow$ *Rechazado correctamente*.
   * **QA-04**: Dominio de estado inválido (`FINAL_X`) $\rightarrow$ *Rechazado correctamente*.
   * **QA-05**: Integridad referencial con UUID huérfano $\rightarrow$ *Rechazado correctamente*.
   * **QA-06**: Coherencia temporal (`fecha_fin < fecha_inicio`) $\rightarrow$ *Rechazado correctamente*.
   * **QA-07**: Borde superior duración = 121 min $\rightarrow$ *Rechazado correctamente*.
   * **QA-08**: Unicidad 1:1 expediente duplicado $\rightarrow$ *Rechazado correctamente*.
   * **QA-09**: Prevención de traslape de horario en citas $\rightarrow$ *Rechazado correctamente*.
   * **QA-10**: Auditoría automática de cambios $\rightarrow$ *Registrado en auditoria*.

---

## 4. Configuración Local (`.env`)

Cuando tu compañero te entregue los accesos de la base de datos:
1. Duplica el archivo `.env.example` y renómbralo a `.env`.
2. Completa los valores de `SUPABASE_URL`, `SUPABASE_ANON_KEY` o `DATABASE_URL`.

---

## 5. Distribución de Responsabilidades del Equipo

1. **Análisis, Estructura Principal y Base de Datos**: Modelado conceptual, diseño relacional DDL, constraints de integridad y modularidad.
2. **Desarrollo Posterior del Software**: Capa de API/backend, servicios e interfaces de usuario.
3. **Diseño, Ejecución y Documentación de Pruebas de Calidad**: Plan SQA, técnicas de prueba (borde, dominio, relación), matriz de pruebas y generación de evidencias bajo ISO/IEC 25010.
