-- =============================================================================
-- MIGRACIÓN 01: EXTENSIONES DE POSTGRESQL / SUPABASE
-- Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico
-- =============================================================================

-- Habilitar extensión para generación de identificadores únicos UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión para funciones criptográficas y hashing de contraseñas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
