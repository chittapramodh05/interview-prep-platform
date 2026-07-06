import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Protect all analytics/dashboard routes
router.use(authenticateJWT);

router.get('/dashboard', AnalyticsController.getDashboardStats);
router.get('/notifications', AnalyticsController.getNotifications);
router.post('/notifications/:id/read', AnalyticsController.markNotificationRead);

export default router;
