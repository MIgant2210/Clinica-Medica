import { Router } from 'express';
import { procesarPreguntaMedica, resumirExpediente } from './ia.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';

const router = Router();

router.use(autenticarJWT);

router.post('/chat', procesarPreguntaMedica);
router.post('/resumir', resumirExpediente);

export default router;
