import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { generarToken } from '../../config/jwt';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';

export const login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      ok: false,
      error: 'Se requiere correo y contraseña para iniciar sesión.',
    });
  }

  try {
    // Buscar usuario en PostgreSQL
    const { rows } = await pool!.query('SELECT * FROM usuarios WHERE correo = $1', [correo.toLowerCase().trim()]);
    const usuario = rows[0];

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
      personaId: usuario.persona_id,
      nombreCompleto: usuario.nombre_completo,
      profesionalId: usuario.profesional_id,
      pacienteId: usuario.paciente_id,
      sedesAutorizadas: usuario.sedes_autorizadas || [],
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
        nombreCompleto: usuario.nombre_completo,
        profesionalId: usuario.profesional_id,
        pacienteId: usuario.paciente_id,
        sedesAutorizadas: usuario.sedes_autorizadas || [],
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor al iniciar sesión' });
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
