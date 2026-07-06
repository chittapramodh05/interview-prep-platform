import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Protect all interview routes
router.use(authenticateJWT);

router.post('/start', InterviewController.startInterview);
router.post('/:id/answer', InterviewController.submitAnswer);
router.post('/:id/finish', InterviewController.finishInterview);
router.get('/history', InterviewController.getHistory);
router.get('/report/:id', InterviewController.getReport);

export default router;
