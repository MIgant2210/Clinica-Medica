# Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico (ECE)

> **Proyecto**: Aseguramiento de Calidad de Software (Decimo Semestre)  
> **Universidad**: Universidad Mariano Gálvez de Guatemala • Sede Villa Nueva  
> **Equipo**: Miguel Antonio Donis Morales (5190-21-6735), Angie Melissa Velásquez Yoc (5190-22-3568), Samuel Sagastume (5190-15-12008)  
> **Repositorio Oficial**: [https://github.com/MIgant2210/Clinica-Medica](https://github.com/MIgant2210/Clinica-Medica)

---

## 1. Arquitectura de la Solución (Full Stack en 4 Capas)

La solución adopta una arquitectura desacoplada Cliente-Servidor gobernada por la norma internacional **ISO/IEC 25010** y el principio de **Defensa en Profundidad**:

```
+-------------------------------------------------------------+
|                      1. PRESENTACIÓN                        |
|   Frontend SPA React 18 + Vite + TypeScript + TailwindCSS   |
|         (Escritorio para recepción / Tabletas médicas)      |
+-------------------------------------------------------------+
                              |
                              v (Peticiones HTTP REST con JWT)
+-------------------------------------------------------------+
|              2. AUTENTICACIÓN Y AUTORIZACIÓN                |
|      Tokens JWT | RBAC (ADMIN, MEDICO, RECEPCIONISTA, PAC)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                 3. SERVIDOR API (BACKEND)                   |
|           Node.js + Express + TypeScript (Modular)          |
|    Validaciones de Borde (15-120 min) | Traslapes de Citas  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             4. BASE DE DATOS (PostgreSQL / Supabase)        |
|  Modelo Relacional ACID | Triggers | Auditoría Transversal  |
+-------------------------------------------------------------+
```

---

## 2. Estructura del Proyecto

```text
Clinica-Medica/
├── docker-compose.yml                   # Orquestación completa (DB + Backend + Frontend)
├── .env.example                         # Plantilla de variables de entorno globales
├── .gitignore
├── README.md
│
├── docs/                                # Documentación formal de la Fase 1
│   ├── 01_analisis_y_requisitos.md      # RF-01 a RF-09, RNF ISO 25010 y Reglas de Negocio
│   ├── 02_modelo_organizacional_y_arquitectura.md # Capas y modelo RBAC con ámbito
│   ├── 03_diccionario_de_datos.md       # Tablas, campos, tipos, UUIDs y constraints
│   └── 04_plan_aseguramiento_calidad_sqa.md # Plan SQA y Matriz de Pruebas (QA-01 a QA-10)
│
├── database/                            # Scripts SQL para Supabase / PostgreSQL
│   ├── migrations/                      # Esquemas modulares en orden de ejecución
│   ├── seeds/                           # Datos de prueba (organizaciones, doctores, citas)
│   ├── tests_qa/                        # Suite de pruebas automatizada en SQL
│   └── install_all.sql                  # Script maestro unificado en una sola transacción
│
├── backend/                             # API RESTful (Node.js + Express + TypeScript)
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/                      # Conexión DB (Modo Dual: PostgreSQL / Mock inicial) y JWT
│       ├── middlewares/                 # Auth JWT Bearer y RBAC por rol
│       ├── modules/
│       │   ├── auth/                    # Login y generación de JWT
│       │   ├── organizacion/            # Sedes, especialidades, servicios, doctores
│       │   ├── pacientes/               # Directorio y registro con apertura de ECE
│       │   ├── citas/                   # Agenda médica con reglas SQA y prevención de traslape
│       │   ├── clinico/                 # Expediente Clínico, signos vitales, CIE-10 y recetas
│       │   └── auditoria/               # Bitácora transversal de cambios (ISO/IEC 25010)
│       └── server.ts
│
└── frontend/                            # SPA Cliente (React + Vite + TypeScript + Tailwind)
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/                         # Cliente Axios con interceptor JWT
        ├── context/                     # AuthContext con selector rápido de roles para pruebas
        ├── components/                  # Navbar, Sidebar y componentes modulares
        ├── pages/
        │   ├── LoginPage.tsx            # Login con accesos rápidos de prueba
        │   ├── DashboardPage.tsx        # Métricas interactivas y próximas citas
        │   ├── CitasPage.tsx            # Calendario, agendamiento y cambio de estados
        │   ├── PacientesPage.tsx        # Directorio con búsqueda reactiva y nuevo paciente
        │   ├── ExpedientePage.tsx       # ECE, signos vitales, CIE-10 y recetas
        │   └── AuditoriaPage.tsx        # Visor de trazas de auditoría SQA
        └── App.tsx                      # Enrutamiento protegido
```

---

## 3. Instrucciones de Ejecución Local

Puedes ejecutar la aplicación de dos formas:

### Opción 1: Ejecución Directa con Node.js (Recomendada para Desarrollo)

#### 1. Iniciar el Backend
Abre una terminal en la carpeta `backend`:
```bash
cd backend
npm install
npm run dev
```
> La API quedará disponible en: **`http://localhost:4000`**  
> Verificación de estado: **`http://localhost:4000/api/health`**

#### 2. Iniciar el Frontend
En otra terminal, ve a la carpeta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
> La aplicación web abrirá en: **`http://localhost:3000`**

---

### Opción 2: Ejecución Completa con Docker Compose

Si cuentas con Docker en tu máquina, puedes levantar PostgreSQL, el Backend y el Frontend con un solo comando en la raíz del proyecto:
```bash
docker-compose up --build
```

---

## 4. Credenciales de Prueba Preconfiguradas (Acceso 1-Clic)

En la pantalla de Login (`/login`) encontrarás botones interactivos para ingresar con cualquier perfil sin necesidad de escribir la contraseña:

| Perfil | Correo | Contraseña | Capacidades en el Sistema |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@clinica.com` | `admin123` | Acceso global, administración y bitácora de auditoría SQA. |
| **Médico** | `dr.mendoza@redsalud.gt` | `medico123` | Atención de citas, consulta de ECE, diagnóstico CIE-10 y recetas. |
| **Recepcionista** | `recepcion@redsalud.gt` | `recep123` | Agendamiento de citas, confirmaciones y alta de pacientes. |
| **Paciente** | `juan.perez@gmail.com` | `paciente123` | Consulta de su propio expediente médico y citas programadas. |

---

## 5. Cumplimiento de Normativa SQA (ISO/IEC 25010)

1. **Condiciones de Borde**: Validadas en backend y base de datos (duración de citas entre 15 y 120 minutos).
2. **Coherencia Temporal**: Validación estricta `fecha_fin > fecha_inicio`.
3. **Prevención de Traslapes (RN-02)**: Bloqueo de agendas duplicadas para un mismo facultativo en el mismo horario.
4. **Trazabilidad y No Repudio**: Bitácora inmutable de auditoría para cada inserción o cambio de estado.
