import { Router } from 'express';
import { getSedes, getEspecialidades, getServicios, getProfesionales } from './organizacion.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';

const router = Router();

router.use(autenticarJWT);

router.get('/sedes', getSedes);
router.get('/especialidades', getEspecialidades);
router.get('/servicios', getServicios);
router.get('/profesionales', getProfesionales);

export default router;
