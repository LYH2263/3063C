import { Router } from 'express';
import { getMessages, postMessage, adminGetMessages, adminUpdateMessageStatus, adminDeleteMessage } from '../controllers/message';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Public / User
router.get('/', asyncHandler(getMessages));
router.post('/', authenticate, asyncHandler(postMessage));

// Admin
router.get('/admin', authenticate, requireAdmin, asyncHandler(adminGetMessages));
router.put('/admin/:id', authenticate, requireAdmin, asyncHandler(adminUpdateMessageStatus));
router.delete('/admin/:id', authenticate, requireAdmin, asyncHandler(adminDeleteMessage));

export default router;
