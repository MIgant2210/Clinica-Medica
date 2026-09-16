import { Request, Response } from 'express';
import { inMemoryStore } from '../../config/db';

export const getAuditoria = async (req: Request, res: Response) => {
  return res.json({
    ok: true,
    total: inMemoryStore.auditoria.length,
    trazas: [...inMemoryStore.auditoria].reverse(),
  });
};
