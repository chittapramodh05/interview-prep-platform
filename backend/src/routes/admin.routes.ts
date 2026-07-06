import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protect all admin routes with JWT authentication and Admin role enforcement
router.use(authenticateJWT, requireAdmin);

router.get('/users', AdminController.getUsers);
router.post('/questions', AdminController.createCodingQuestion);
router.get('/stats', AdminController.getPlatformStats);

export default router;
