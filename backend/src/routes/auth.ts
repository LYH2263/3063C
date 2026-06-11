import { Router } from 'express';
import { login, register, updateProfile } from '../controllers/auth';
import { asyncHandler } from '../middleware/error';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.put('/profile', authenticate, asyncHandler(updateProfile));

export default router;
