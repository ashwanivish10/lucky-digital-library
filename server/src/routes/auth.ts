import { Router } from 'express';
import { login, logout, me, changePassword, setFirstPassword } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, changePassword);
router.post('/set-first-password', requireAuth, setFirstPassword);

export default router;

