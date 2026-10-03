import { Request, Response } from 'express';
import { pool, inMemoryStore } from '../../config/db';
import { generarToken } from '../../config/jwt';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { validarRegistroUsuario } from './auth.validator';

export const login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      ok: false,
      error: 'Se requiere correo y contraseña para iniciar sesión.',
    });
  }

  try {
    // Buscar usuario en PostgreSQL o fallback
    let usuario: any = null;
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo.toLowerCase().trim()]);
      usuario = rows[0];
    }

    if (!usuario) {
      // Buscar en memoria
      usuario = inMemoryStore.usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase().trim());
    }

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas: Usuario no encontrado.',
      });
    }

    // Comprobar contraseña usando bcrypt
    const esValida = await bcrypt.compare(contrasena, usuario.password_hash);

    if (!esValida) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas: Contraseña incorrecta.',
      });
    }

    const token = generarToken({
      id: usuario.id,
      usuario: usuario.usuario,
      correo: usuario.correo,
      rol: usuario.rol,
      personaId: usuario.persona_id || usuario.personaId,
      nombreCompleto: usuario.nombre_completo || usuario.nombreCompleto,
      profesionalId: usuario.profesional_id || usuario.profesionalId,
      pacienteId: usuario.paciente_id || usuario.pacienteId,
      sedesAutorizadas: usuario.sedes_autorizadas || usuario.sedesAutorizadas || [],
    });

    return res.json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        usuario: usuario.usuario,
        correo: usuario.correo,
        rol: usuario.rol,
        nombreCompleto: usuario.nombre_completo || usuario.nombreCompleto,
        profesionalId: usuario.profesional_id || usuario.profesionalId,
        pacienteId: usuario.paciente_id || usuario.pacienteId,
        sedesAutorizadas: usuario.sedes_autorizadas || usuario.sedesAutorizadas || [],
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor al iniciar sesión' });
  }
};

/**
 * Registro de Nuevo Usuario / Paciente con validaciones rigurosas SQA (ISO/IEC 25010)
 */
export const registro = async (req: Request, res: Response) => {
  try {
    // 1. Validaciones profesionales SQA (BVA, Formato, Obligatoriedad, Dominio, Seguridad)
    const validacion = validarRegistroUsuario(req.body);
    if (!validacion.isValid || !validacion.sanitized) {
      return res.status(400).json({
        ok: false,
        error: 'Datos de registro no conformes a las especificaciones de calidad (SQA).',
        errors: validacion.errors,
      });
    }

    const {
      nombre_completo,
      primer_nombre,
      primer_apellido,
      correo,
      contrasena,
      fecha_nacimiento,
      numero_documento,
      telefono,
      sexo,
      tipo_sangre,
      usuario,
      edad
    } = validacion.sanitized;

    // 2. Control de unicidad de correo y documento (Integridad de datos)
    if (pool) {
      const existeCorreo = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
      if (existeCorreo.rows.length > 0) {
        return res.status(409).json({
          ok: false,
          error: 'El correo electrónico ya se encuentra registrado en la plataforma (QA-UNIQ-EMAIL).',
          campo: 'correo'
        });
      }

      if (numero_documento) {
        const existeDoc = await pool.query('SELECT id FROM personas WHERE numero_documento = $1', [numero_documento]);
        if (existeDoc.rows.length > 0) {
          return res.status(409).json({
            ok: false,
            error: 'El número de identificación (DPI) ya está registrado en el sistema clínico (QA-UNIQ-DOC).',
            campo: 'numero_documento'
          });
        }
      }
    } else {
      const existeMem = inMemoryStore.usuarios.some(u => u.correo.toLowerCase() === correo);
      if (existeMem) {
        return res.status(409).json({
          ok: false,
          error: 'El correo electrónico ya se encuentra registrado en la plataforma (QA-UNIQ-EMAIL).',
          campo: 'correo'
        });
      }
    }

    // 3. Cifrado seguro de contraseña con Bcrypt
    const passwordHash = await bcrypt.hash(contrasena, 10);

    // 4. Generación de claves UUID e identificadores clínicos normalizados
    const personaId = uuidv4();
    const pacienteId = uuidv4();
    const expedienteId = uuidv4();
    const usuarioId = uuidv4();
    const sufijoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const codigoPaciente = `PAC-${new Date().getFullYear()}-${sufijoAleatorio}`;
    const numeroExpediente = `EXP-${new Date().getFullYear()}-${sufijoAleatorio}`;
    const usuarioFinal = `${usuario}${Math.floor(100 + Math.random() * 900)}`;

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Inserción en personas
        await client.query(
          `INSERT INTO personas (id, tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [personaId, 'DPI', numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo]
        );

        // Inserción en pacientes
        await client.query(
          `INSERT INTO pacientes (id, persona_id, codigo_paciente, nombre_completo, documento, tipo_sangre, telefono, correo, contacto_emergencia, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [pacienteId, personaId, codigoPaciente, nombre_completo, numero_documento, tipo_sangre, telefono, correo, 'Contacto registrado al alta inicial', 'ACTIVO']
        );

        // Inserción en expedientes (Expediente Clínico Electrónico 1:1)
        await client.query(
          `INSERT INTO expedientes (id, paciente_id, numero_expediente, antecedentes_patologicos, antecedentes_alergias, antecedentes_familiares)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [expedienteId, pacienteId, numeroExpediente, 'Ninguno reportado en alta autónoma', 'Ninguna reportada', 'Ninguno reportado']
        );

        // Inserción en usuarios (Rol PACIENTE por defecto)
        await client.query(
          `INSERT INTO usuarios (id, correo, password_hash, usuario, nombre_completo, rol, persona_id, paciente_id, estado, fecha_registro)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [usuarioId, correo, passwordHash, usuarioFinal, nombre_completo, 'PACIENTE', personaId, pacienteId, 'ACTIVO']
        );

        // Inserción en bitácora de auditoría (Trazabilidad ISO 25010)
        await client.query(
          `INSERT INTO auditoria (id, tabla, registro_id, accion, usuario_nombre, fecha_accion, detalles)
           VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
          [uuidv4(), 'usuarios', usuarioId, 'REGISTRO_AUTONOMO', nombre_completo, `Registro autónomo de usuario PACIENTE con expediente ${numeroExpediente} (Edad: ${edad} años)`]
        );

        await client.query('COMMIT');
      } catch (dbErr) {
        await client.query('ROLLBACK');
        console.error('Error en transacción de registro:', dbErr);
        throw dbErr;
      } finally {
        client.release();
      }
    }

    // Sincronizar en almacén en memoria
    inMemoryStore.usuarios.push({
      id: usuarioId,
      correo,
      password_hash: passwordHash,
      usuario: usuarioFinal,
      nombreCompleto: nombre_completo,
      rol: 'PACIENTE',
      personaId,
      pacienteId,
    });

    inMemoryStore.pacientes.push({
      id: pacienteId,
      persona_id: personaId,
      codigo_paciente: codigoPaciente,
      nombre_completo: nombre_completo,
      documento: numero_documento,
      tipo_sangre,
      telefono,
      correo,
      contacto_emergencia: 'Contacto registrado al alta inicial',
      estado: 'ACTIVO'
    });

    // 6. Generación de Token JWT
    const token = generarToken({
      id: usuarioId,
      usuario: usuarioFinal,
      correo,
      rol: 'PACIENTE',
      personaId,
      nombreCompleto: nombre_completo,
      pacienteId,
      sedesAutorizadas: [],
    });

    return res.status(201).json({
      ok: true,
      mensaje: '¡Registro completado exitosamente! Se ha creado tu cuenta y expediente clínico.',
      token,
      usuario: {
        id: usuarioId,
        usuario: usuarioFinal,
        correo,
        rol: 'PACIENTE',
        nombreCompleto: nombre_completo,
        personaId,
        pacienteId,
        codigoPaciente,
        numeroExpediente,
        sedesAutorizadas: [],
      }
    });

  } catch (error: any) {
    console.error('Error en endpoint de registro:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno al procesar el registro.',
      detalle: error.message
    });
  }
};

export const getPerfil = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: 'No autenticado' });
  }

  return res.json({
    ok: true,
    usuario: req.user,
  });
};
