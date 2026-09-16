import { Request, Response, NextFunction } from 'express';
import { verificarToken, TokenPayload } from '../config/jwt';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const autenticarJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      error: 'Acceso denegado: Se requiere token de autorización Bearer.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({
      ok: false,
      error: 'Token inválido o expirado. Inicie sesión nuevamente.',
    });
  }
};
