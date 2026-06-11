import { Router } from 'express';
import { getWorks, getWorkDetail, toggleInteraction, getMyFavorites, adminGetWorks, adminCreateWork, adminUpdateWork, adminDeleteWork } from '../controllers/work';
import { authenticate, requireAdmin } from '../middleware/auth';
import { logOperation } from '../middleware/logger';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Public
router.get('/', asyncHandler(getWorks));
router.get('/:id', asyncHandler(getWorkDetail));

// User
router.post('/:id/interact', authenticate, asyncHandler(toggleInteraction));
router.get('/user/favorites', authenticate, asyncHandler(getMyFavorites));

// Admin
router.get('/admin/all', authenticate, requireAdmin, asyncHandler(adminGetWorks));
router.post('/admin', authenticate, requireAdmin, logOperation('CREATE_WORK'), asyncHandler(adminCreateWork));
router.put('/admin/:id', authenticate, requireAdmin, logOperation('UPDATE_WORK'), asyncHandler(adminUpdateWork));
router.delete('/admin/:id', authenticate, requireAdmin, logOperation('DELETE_WORK'), asyncHandler(adminDeleteWork));

export default router;
