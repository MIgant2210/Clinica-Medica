import { Router } from 'express';
import { procesarPreguntaMedica, resumirExpediente } from './ia.controller';
import { verificarAutenticacion } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.post('/chat', procesarPreguntaMedica);
router.post('/resumir', resumirExpediente);

export default router;
