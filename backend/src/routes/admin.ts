import { Router } from 'express';
import { adminGetUsers, adminToggleUserStatus, adminResetUserPassword, adminAddSubAdmin, adminGetOperationLogs } from '../controllers/admin';
import { authenticate, requireAdmin } from '../middleware/auth';
import { logOperation } from '../middleware/logger';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', asyncHandler(adminGetUsers));
router.put('/users/:id/status', logOperation('TOGGLE_USER_STATUS'), asyncHandler(adminToggleUserStatus));
router.post('/users/:id/reset-password', logOperation('RESET_USER_PASSWORD'), asyncHandler(adminResetUserPassword));
router.post('/users/sub-admin', logOperation('ADD_SUB_ADMIN'), asyncHandler(adminAddSubAdmin));

router.get('/operation-logs', asyncHandler(adminGetOperationLogs));

export default router;
