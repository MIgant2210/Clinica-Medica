import { Router } from 'express';
import { getPacientes, getPacienteById, createPaciente } from './pacientes.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';
import { autorizarRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(autenticarJWT);

router.get('/', autorizarRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), getPacientes);
router.get('/:id', autorizarRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), getPacienteById);
router.post('/', autorizarRoles('ADMIN', 'RECEPCIONISTA'), createPaciente);

export default router;
