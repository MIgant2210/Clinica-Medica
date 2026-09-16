# 04 - Plan de Aseguramiento de Calidad de Software (SQA) y Matriz de Pruebas

**Proyecto**: Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico  
**Curso**: Aseguramiento de Calidad de Software  
**Institución**: Universidad Mariano Gálvez de Guatemala  
**Marco Normativo**: ISO/IEC 25010 – Calidad de Producto de Software  

---

## 1. Enfoque SQA Integrado al Ciclo de Desarrollo

En la ingeniería de software tradicional, las pruebas de calidad solían relegarse a las etapas finales del desarrollo visual. Bajo el enfoque de **Aseguramiento de Calidad (SQA)** de esta asignatura, la calidad es una disciplina preventiva e incremental:

$$\text{Requisito} \longrightarrow \text{Diseño} \longrightarrow \text{Restricción en BD} \longrightarrow \text{Prueba} \longrightarrow \text{Evidencia Técnica}$$

### Verificación vs. Validación
* **Verificación (*¿Construimos el sistema correctamente?*)**: Comprobamos que el esquema de la base de datos cumpla rigurosamente las especificaciones técnicas, las normas de normalización, las restricciones de tipo, integridad referencial (`FOREIGN KEY`), dominios (`CHECK`) y que rechace operaciones inválidas.
* **Validación (*¿Construimos el sistema correcto?*)**: Comprobamos que el modelo represente de manera fiel la realidad clínica: que un médico cuente con su historial, que no se traslapen turnos de atención y que el paciente tenga una sola identidad central.

---

## 2. Características ISO/IEC 25010 Aplicadas al Diseño

1. **Adecuación Funcional**: Las tablas y procedimientos soportan integralmente el flujo del paciente (Registro $\rightarrow$ Cita $\rightarrow$ Consulta $\rightarrow$ Diagnóstico/Tratamiento).
2. **Fiabilidad**: La base de datos garantiza consistencia ACID mediante transacciones y bloqueos de datos huérfanos.
3. **Seguridad**: Control de acceso granular (RBAC con ámbito) y registro inmutable de auditoría para cada alteración de registros médicos.
4. **Mantenibilidad**: Estructura modular dividida en esquemas y catálogos independientes, permitiendo incorporar módulos de facturación o laboratorio sin reestructurar el núcleo.
5. **Usabilidad**: Estados semánticos unívocos que eliminan estados ambiguos en la gestión clínica.

---

## 3. Técnicas de Prueba Aplicadas a la Base de Datos

* **Análisis de Valores de Borde (Boundary Value Analysis - BVA)**:
  * Prueba de valores límite superior e inferior permitidos (ej. duración de cita médica: 14 min [inválido], 15 min [límite inferior válido], 120 min [límite superior válido], 121 min [inválido]).
* **Prueba de Dominio (Domain Testing)**:
  * Validación de listas cerradas de valores admisibles mediante constraints tipo `CHECK` (ej. estados de cita: `PROGRAMADA`, `CONFIRMADA`, `ATENDIDA`, `CANCELADA`, etc. Rechazo de cadenas arbitrarias como `FINAL_X`).
* **Prueba de Obligatoriedad (Nullability Testing)**:
  * Validación de integridad de campos mandatorios (`NOT NULL`) para evitar estados incompletos (ej. `paciente_id` nulo al programar cita).
* **Integridad Referencial y Relaciones entre Datos**:
  * Comprobación del rechazo de claves foráneas huérfanas (UUIDs no existentes).
  * Coherencia lógica entre pares de fechas (`fecha_fin > fecha_inicio`).
  * Unicidad 1:1 de expediente clínico por paciente (`UNIQUE(paciente_id)`).

---

## 4. Matriz Inicial de Pruebas de Calidad (SQA Test Matrix)

| ID | Característica / Técnica | Entidad / Campo Evaluado | Entrada / Condición de Prueba | Resultado Esperado | Resultado Técnico BD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **QA-01** | Borde (Límite Inferior - 1) | `cita.duracion_minutos` | `duracion_minutos = 14` | **Rechazar** | Error `check_constraint_violation` |
| **QA-02** | Borde (Límite Inferior) | `cita.duracion_minutos` | `duracion_minutos = 15` | **Aceptar** | Inserción exitosa |
| **QA-03** | Obligatoriedad (`NOT NULL`) | `cita.paciente_id` | `paciente_id = NULL` | **Rechazar** | Error `not_null_violation` |
| **QA-04** | Dominio (`CHECK IN (...)`) | `cita.estado` | `estado = 'FINAL_X'` | **Rechazar** | Error `check_constraint_violation` |
| **QA-05** | Integridad Referencial (`FK`) | `cita.paciente_id` | `paciente_id = UUID inexistente` | **Rechazar** | Error `foreign_key_violation` |
| **QA-06** | Coherencia Temporal (`CHECK`) | `cita.fecha_inicio` y `fin` | `fecha_fin < fecha_inicio` | **Rechazar** | Error `check_constraint_violation` |
| **QA-07** | Borde (Límite Superior + 1) | `cita.duracion_minutos` | `duracion_minutos = 121` | **Rechazar** | Error `check_constraint_violation` |
| **QA-08** | Unicidad 1:1 (`UNIQUE`) | `expediente_clinico` | Segundo expediente al mismo `paciente_id` | **Rechazar** | Error `unique_violation` |
| **QA-09** | Coherencia Biográfica | `persona.fecha_nacimiento`| `fecha_nacimiento = Mañana` | **Rechazar** | Error `check_constraint_violation` |
| **QA-10** | Trazabilidad Transversal | `cita` (Cambio de estado)| `UPDATE cita SET estado = 'CONFIRMADA'` | **Aceptar y Registrar** | Inserción automática en `auditoria` |

---

## 5. Procedimiento de Demostración de Evidencias

El script de pruebas `database/tests_qa/01_matriz_pruebas.sql` está diseñado con bloques anónimos PL/pgSQL (`DO $$ ... $$`) que intentan ejecutar las operaciones anteriores y capturan las excepciones de PostgreSQL. Si la base de datos rechaza la operación incorrecta tal como exige la regla de negocio, la prueba se registra como **EXITOSA (PASSED)**, generando la salida tabular para el informe académico de la UMG.
