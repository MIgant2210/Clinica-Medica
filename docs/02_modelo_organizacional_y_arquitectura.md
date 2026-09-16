# 02 - Modelo Organizacional y Arquitectura del Sistema

**Proyecto**: Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico  
**Curso**: Aseguramiento de Calidad de Software  
**Institución**: Universidad Mariano Gálvez de Guatemala  

---

## 1. Arquitectura Conceptual por Capas

El sistema se estructura bajo una arquitectura en cuatro capas desacopladas, implementando el principio de **Defensa en Profundidad**:

```
+-------------------------------------------------------------+
|                      1. PRESENTACIÓN                        |
|   Aplicación Web SPA / Portal Clínico / Portal de Pacientes |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|              2. AUTENTICACIÓN Y AUTORIZACIÓN                |
|      Identidad de Usuario | Roles | Permisos | Ámbito       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                   3. LÓGICA DE NEGOCIO / API                |
|       Validaciones de Negocio | Servicios | Transacciones   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                4. CAPA DE DATOS (PostgreSQL / Supabase)      |
|  Tablas | Restricciones de Integridad | Triggers | Auditoría|
+-------------------------------------------------------------+
```

### Principio de Defensa en Profundidad
La validación de reglas de negocio no descansa únicamente en la interfaz visual (frontend), la cual es vulnerable a manipulaciones del lado del cliente. La integridad y seguridad se garantizan a nivel de:
1. **Lógica de la aplicación**: Autorización y reglas de flujo.
2. **Motor de base de datos (PostgreSQL/Supabase)**: Restricciones de tipo, claves foráneas, llaves únicas compuestas, expresiones `CHECK`, y triggers automáticos de auditoría.

---

## 2. Estructura del Negocio vs. Catálogos Reutilizables

Para evitar rigidez en el crecimiento de la clínica, el modelo distingue entre **Estructura Jerárquica** y **Catálogos Reutilizables**:

```
ESTRUCTURA ORGANIZACIONAL                   CATÁLOGOS REUTILIZABLES
[ Organización ]                                [ Especialidad ]
       |                                                |
       v                                                v
   [ Clínica ]                                     [ Servicio ]
       |                                          (ej: Consulta General,
       v                                           Pediatría, Ecografía)
    [ Sede ] (Ubicación física)                         |
       |                                                |
       v                                                v
    [ Área ] (Consulta Externa, Urgencias, etc.) <-------+ (Asignados por Sede)
```

* **Organización**: Entidad jurídica o corporativa administradora.
* **Clínica**: Unidad médico-asistencial perteneciente a la organización.
* **Sede**: Ubicación geográfica o sucursal física.
* **Área**: Espacio funcional dentro de una sede (ej. Consulta Externa, Laboratorio, Imagenología).
* **Especialidades y Servicios**: No son jerarquías rígidas estáticas, sino catálogos maestros asignables a profesionales y sedes mediante tablas intermedias. Una misma especialidad (ej. Cardiología) puede estar activa en múltiples sedes.

---

## 3. Modelo de Identidad y Separación de Perfiles

Uno de los errores más comunes en sistemas de salud es crear tablas aisladas de pacientes y médicos con campos redundantes (nombre, teléfono, DPI, correo). En este diseño, la entidad **`persona`** concentra la identidad biográfica única:

```
                          +-------------------+
                          |      PERSONA      |
                          | (Identidad Única) |
                          +-------------------+
                            /        |        \
                           /         |         \
                          v          v          v
                 +------------+ +----------+ +-----------+
                 |  PACIENTE  | | EMPLEADO | |  USUARIO  |
                 +------------+ +----------+ +-----------+
                                     |             |
                                     v             v
                             +-------------+  +---------+
                             | PROFESIONAL |  |   ROL   |
                             |  DE SALUD   |  +---------+
                             +-------------+       |
                                                   v
                                              +---------+
                                              | PERMISO |
                                              +---------+
```

### Beneficios del Modelo
* Una persona puede ser a la vez **empleado** y **paciente** de la institución sin duplicar datos ni causar inconsistencias.
* Si el paciente actualiza su número de teléfono o dirección, la modificación se refleja inmediatamente en todo el sistema.
* La cuenta de acceso (`usuario`) está vinculada a `persona`, permitiendo asociar credenciales de acceso digital a cualquier individuo identificado.

---

## 4. Control de Acceso Basado en Roles (RBAC) con Ámbito Organizacional

Tener asignado un rol (ej. *Recepcionista* o *Médico*) no otorga acceso irrestricto a toda la red médica. El modelo implementa **Ámbito de Acceso (Scope)**:

```
[ Usuario ] ---> [ Rol ] ---> [ Permisos ]
     |
     +---------> [ Asignación de Ámbito ] ---> [ Sede o Área Autorizada ]
```

* **Rol**: Conjunto de capacidades lógicas (ej. `MEDICO`, `RECEPCIONISTA`, `ADMINISTRADOR`, `ENFERMERO`).
* **Permiso**: Acción atómica permitida (ej. `cita:crear`, `expediente:leer`, `consulta:diagnosticar`).
* **Ámbito (`usuario_asignacion_ambito`)**: Delimita la sede o área donde el usuario tiene legitimidad para operar. Un médico asignado a la *Sede Central* no puede visualizar ni registrar agendas en la *Sede Norte* a menos que cuente con una asignación explícita.
