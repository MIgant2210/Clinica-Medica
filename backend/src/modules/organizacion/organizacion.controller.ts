import { Request, Response } from 'express';
import { inMemoryStore } from '../../config/db';

export const getSedes = async (req: Request, res: Response) => {
  return res.json({
    ok: true,
    sedes: inMemoryStore.sedes,
  });
};

export const getEspecialidades = async (req: Request, res: Response) => {
  return res.json({
    ok: true,
    especialidades: inMemoryStore.especialidades,
  });
};

export const getServicios = async (req: Request, res: Response) => {
  return res.json({
    ok: true,
    servicios: inMemoryStore.servicios,
  });
};

export const getProfesionales = async (req: Request, res: Response) => {
  return res.json({
    ok: true,
    profesionales: inMemoryStore.profesionales,
  });
};
