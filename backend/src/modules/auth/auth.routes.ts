import { Router } from 'express';
import { login, getPerfil } from './auth.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/perfil', autenticarJWT, getPerfil);

export default router;
