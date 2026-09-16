import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_clinica_medica_umg_2026';

export interface TokenPayload {
  id: string;
  usuario: string;
  correo: string;
  rol: string;
  personaId: string;
  nombreCompleto: string;
  profesionalId?: string;
  pacienteId?: string;
  sedesAutorizadas?: string[];
}

export const generarToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
};

export const verificarToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
