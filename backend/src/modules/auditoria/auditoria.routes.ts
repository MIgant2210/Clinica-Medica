import { Router } from 'express';
import { getAuditoria } from './auditoria.controller';
import { autenticarJWT } from '../../middlewares/auth.middleware';
import { autorizarRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(autenticarJWT);
router.get('/', autorizarRoles('ADMIN'), getAuditoria);

export default router;
