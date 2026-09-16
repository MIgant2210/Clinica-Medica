import { Request, Response } from 'express';
import { inMemoryStore } from '../../config/db';
import { generarToken } from '../../config/jwt';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      ok: false,
      error: 'Se requiere correo y contraseña para iniciar sesión.',
    });
  }

  // Buscar usuario en almacén
  const usuario = inMemoryStore.usuarios.find(
    (u) => u.correo.toLowerCase() === correo.toLowerCase().trim()
  );

  if (!usuario) {
    return res.status(401).json({
      ok: false,
      error: 'Credenciales inválidas: Usuario no encontrado.',
    });
  }

  // Comprobar contraseña (admitir las contraseñas predefinidas para pruebas)
  const contrasenasValidas = ['admin123', 'medico123', 'recep123', 'paciente123', '123456'];
  const esValida = contrasenasValidas.includes(contrasena);

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
    personaId: usuario.personaId,
    nombreCompleto: usuario.nombreCompleto,
    sedesAutorizadas: usuario.sedesAutorizadas || [],
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
      nombreCompleto: usuario.nombreCompleto,
      profesionalId: usuario.profesionalId,
      pacienteId: usuario.pacienteId,
      sedesAutorizadas: usuario.sedesAutorizadas || [],
    },
  });
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
