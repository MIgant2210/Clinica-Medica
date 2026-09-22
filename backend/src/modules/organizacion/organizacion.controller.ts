import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getSedes = async (req: Request, res: Response) => {
  const { rows } = await pool!.query('SELECT * FROM sedes');
  return res.json({
    ok: true,
    sedes: rows,
  });
};

export const getEspecialidades = async (req: Request, res: Response) => {
  const { rows } = await pool!.query('SELECT * FROM especialidades');
  return res.json({
    ok: true,
    especialidades: rows,
  });
};

export const getServicios = async (req: Request, res: Response) => {
  const { rows } = await pool!.query('SELECT * FROM servicios');
  return res.json({
    ok: true,
    servicios: rows,
  });
};

export const getProfesionales = async (req: Request, res: Response) => {
  const { rows } = await pool!.query('SELECT * FROM profesionales');
  return res.json({
    ok: true,
    profesionales: rows,
  });
};
