import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getAuditoria = async (req: Request, res: Response) => {
  const { rows } = await pool!.query('SELECT * FROM auditoria ORDER BY fecha_accion DESC');
  return res.json({
    ok: true,
    total: rows.length,
    trazas: rows,
  });
};
