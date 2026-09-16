import { Router } from 'express';
import { getCitas, createCita, updateEstadoCita } from './citas.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';
import { autorizarRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(autenticarJWT);

router.get('/', getCitas);
router.post('/', autorizarRoles('ADMIN', 'RECEPCIONISTA'), createCita);
router.patch('/:id/estado', autorizarRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), updateEstadoCita);

export default router;
