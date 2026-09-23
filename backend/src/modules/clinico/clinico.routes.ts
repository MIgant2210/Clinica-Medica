import { Router } from 'express';
import { getExpedienteByPacienteId, createConsulta, updateAntecedentesExpediente } from './clinico.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';
import { autorizarRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(autenticarJWT);

router.get('/expediente/:pacienteId', getExpedienteByPacienteId);
router.post('/consultas', autorizarRoles('ADMIN', 'MEDICO'), createConsulta);
router.put('/expediente/:expedienteId/antecedentes', autorizarRoles('ADMIN', 'MEDICO'), updateAntecedentesExpediente);

export default router;
