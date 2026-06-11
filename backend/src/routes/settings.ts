import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Public route to get settings
router.get('/', asyncHandler(getSettings));

// Admin route to update settings
router.put('/', authenticate, requireAdmin, asyncHandler(updateSettings));

export default router;
