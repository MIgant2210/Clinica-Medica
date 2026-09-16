# 01 - Análisis de Negocio y Requisitos del Sistema

**Proyecto**: Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico  
**Curso**: Aseguramiento de Calidad de Software  
**Institución**: Universidad Mariano Gálvez de Guatemala  
**Fase**: 1 – Estructura principal, arquitectura de datos y aseguramiento de calidad  

---

## 1. Problema de Negocio y Justificación

En las clínicas médicas tradicionales, la información operativa y clínica se encuentra comúnmente dispersa en múltiples soportes: libretas físicas de turnos, expedientes en papel, hojas de cálculo de recepción y sistemas aislados de facturación o farmacia. 

Esta fragmentación genera los siguientes problemas críticos:
1. **Duplicidad e inconsistencia de datos**: El mismo paciente es registrado varias veces con nombres o datos de contacto discordantes.
2. **Falta de trazabilidad**: Pérdida de continuidad entre la cita asignada, la atención médica recibida, el diagnóstico emitido y el tratamiento recetado.
3. **Inseguridad y accesos no controlados**: Acceso irrestricto a historiales médicos confidenciales sin auditoría de autoría ni de consulta.
4. **Descoordinación interdisciplinaria**: Recepción, médicos y administración manejan versiones distintas del estado real de una cita o servicio.

---

## 2. Propuesta de Valor

El sistema propone una **fuente única de verdad (Single Source of Truth)** centrada en el concepto de **Paciente Único**:

$$\text{Paciente Único} \longrightarrow \text{Citas} \longrightarrow \text{Atención} \longrightarrow \text{Expediente} \longrightarrow \text{Diagnóstico / Tratamiento} \longrightarrow \text{Procesos Administrativos}$$

* **Centralización**: Toda la información converge en una arquitectura relacional robusta.
* **Separación de responsabilidades**: Separación clara entre la persona (identidad), el rol asistencial (paciente), el rol laboral (empleado / profesional de salud) y el perfil de acceso (usuario del sistema).
* **Escalabilidad Multisede**: Capacidad de soportar múltiples organizaciones, clínicas, sedes y áreas operativas sin rediseñar la base de datos.

---

## 3. Requisitos Funcionales (RF)

| ID | Requisito Funcional | Descripción y Criterio de Aceptación |
| :--- | :--- | :--- |
| **RF-01** | Registrar y administrar estructura organizacional | El sistema debe permitir crear y gestionar organizaciones, clínicas, sedes físicas, áreas de atención, especialidades y catálogo de servicios. |
| **RF-02** | Registro de pacientes con identidad única | Registrar pacientes vinculados a una única entidad de persona, garantizando que no se dupliquen registros por documento de identificación (DPI/Pasaporte). |
| **RF-03** | Administración y asignación de personal | Administrar empleados y profesionales de salud, permitiendo su asignación a una o varias sedes, áreas y especialidades médicas. |
| **RF-04** | Gestión de usuarios, roles y permisos | Crear cuentas de usuario seguras y asignarles roles y permisos granulares, condicionados a un ámbito de acceso (sede o área autorizada). |
| **RF-05** | Gestión integral de agenda y citas | Crear, reprogramar, cancelar y consultar citas médicas vinculando paciente, profesional, sede, servicio, fecha y hora. |
| **RF-06** | Expediente clínico único por paciente | Mantener un único expediente clínico electrónico por paciente (relación 1:1), centralizando su historia médica acumulada. |
| **RF-07** | Registro de atenciones, diagnósticos y tratamientos | Registrar consultas clínicas con identificación del profesional tratante, signos vitales, notas de evolución, diagnósticos (CIE-10 o texto) y prescripción de tratamientos. |
| **RF-08** | Auditoría y trazabilidad transversal | Registrar de forma inmutable los eventos de inserción, modificación y eliminación lógica de registros críticos con fecha, hora y usuario autor. |
| **RF-09** | Escalabilidad modular sin rediseño | La estructura debe permitir incorporar futuros módulos (farmacia, inventario, facturación, laboratorio) mediante relaciones referenciales sin alterar el núcleo. |

---

## 4. Requisitos No Funcionales (RNF) - Basados en ISO/IEC 25010

| Característica ISO/IEC 25010 | Requisito No Funcional | Implementación Técnica en Fase 1 |
| :--- | :--- | :--- |
| **Adecuación Funcional** | Completitud y corrección de las transacciones médicas y administrativas. | Validación estricta de esquemas, relaciones foráneas (`FOREIGN KEY`) y valores permitidos. |
| **Fiabilidad / Integridad** | Prevención de estados corruptos, datos huérfanos o inconsistencias temporales. | Restricciones `NOT NULL`, llaves compuestas `UNIQUE`, llaves foráneas con integridad referencial restrictiva y constraints `CHECK`. |
| **Seguridad / Confidencialidad** | Protección de datos sensibles de salud conforme a buenas prácticas médicas. | Identificadores no secuenciales (UUID v4), contraseñas encriptadas mediante `pgcrypto`, y modelo RBAC con ámbito contextual. |
| **Mantenibilidad** | Facilidad de extensión, desacoplamiento y claridad en el diseño. | Separación en catálogos reutilizables, migraciones SQL versionadas y modulares, y diccionario de datos documentado. |
| **Usabilidad** | Consistencia en los flujos y estados predecibles del sistema. | Catálogo estandarizado de estados de citas y consultas para evitar ambigüedades en la interfaz de usuario. |

---

## 5. Reglas de Negocio Críticas (RN)

* **RN-01 (Integridad de Citas)**: Toda cita debe estar obligatoriamente vinculada a un paciente existente, un profesional de la salud asignado, una sede válida y un servicio activo.
* **RN-02 (No Traslape de Horarios)**: Un profesional de la salud no puede tener dos o más citas confirmadas/activas que se superpongan en el mismo intervalo de tiempo en la misma o diferente sede.
* **RN-03 (Límites de Duración de Citas)**: La duración de una cita médica debe ser de al menos 15 minutos y como máximo 120 minutos (`CHECK (duracion_minutos BETWEEN 15 AND 120)`).
* **RN-04 (Coherencia Temporal)**: La fecha y hora de fin de una cita o consulta debe ser estrictamente posterior a la fecha y hora de inicio (`fecha_fin > fecha_inicio`).
* **RN-05 (Expediente Único)**: Cada paciente registrado debe tener uno y solo un expediente clínico en el sistema (`paciente_id UNIQUE` en `expediente_clinico`).
* **RN-06 (Autoría Obligatoria)**: Todo registro clínico (consulta, diagnóstico, evolución, prescripción) debe registrar de manera obligatoria al profesional que emitió la atención.
* **RN-07 (Preservación de Evidencia)**: Los expedientes y consultas clínicas no pueden eliminarse físicamente de la base de datos de manera rutinaria; se utiliza eliminación lógica mediante banderas de estado (`activo = false`) y auditoría.
* **RN-08 (Acceso por Ámbito)**: Un usuario con rol administrativo o clínico solo puede operar en las sedes o áreas geográficas en las que tenga una asignación de ámbito vigente.
