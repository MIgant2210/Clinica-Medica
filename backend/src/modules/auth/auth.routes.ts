import { Router } from 'express';
import { login, registro, getPerfil } from './auth.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', registro);
router.post('/registro', registro);
router.get('/perfil', autenticarJWT, getPerfil);

export default router;
