import { Router } from 'express';
import { getPacientes, createPaciente, getPacienteById, updatePaciente, deletePaciente } from './pacientes.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';
import { autorizarRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.get('/', autenticarJWT, getPacientes);
router.get('/:id', autenticarJWT, getPacienteById);
router.post('/', autenticarJWT, autorizarRoles('RECEPCIONISTA', 'MEDICO'), createPaciente);
router.put('/:id', autenticarJWT, autorizarRoles('RECEPCIONISTA', 'MEDICO'), updatePaciente);
router.delete('/:id', autenticarJWT, autorizarRoles('RECEPCIONISTA', 'MEDICO'), deletePaciente);

export default router;
