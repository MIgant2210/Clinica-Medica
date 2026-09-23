import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './usuarios.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';
import { autorizarRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(autenticarJWT);
router.use(autorizarRoles('ADMIN')); // Solo ADMIN puede gestionar usuarios

router.get('/', getUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
