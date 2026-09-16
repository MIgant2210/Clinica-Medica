import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware para Control de Acceso Basado en Roles (RBAC)
 * @param rolesPermitidos Lista de roles autorizados para el endpoint
 */
export const autorizarRoles = (...rolesPermitidos: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: 'No autenticado: Inicie sesión para acceder a este recurso.',
      });
    }

    const { rol } = req.user;

    // Si el usuario es ADMIN, tiene acceso universal
    if (rol === 'ADMIN' || rolesPermitidos.includes(rol)) {
      return next();
    }

    return res.status(403).json({
      ok: false,
      error: `Acceso restringido: El rol [${rol}] no tiene permisos para realizar esta acción.`,
    });
  };
};
