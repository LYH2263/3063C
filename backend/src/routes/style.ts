import { Router } from 'express';
import { getActiveStyle, getAllStyles, createStyle, updateStyle, setActiveStyle, deleteStyle } from '../controllers/style';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Public
router.get('/active', asyncHandler(getActiveStyle));

// Admin
router.get('/', authenticate, requireAdmin, asyncHandler(getAllStyles));
router.post('/', authenticate, requireAdmin, asyncHandler(createStyle));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateStyle));
router.post('/:id/active', authenticate, requireAdmin, asyncHandler(setActiveStyle));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteStyle));

export default router;
