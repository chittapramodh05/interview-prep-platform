import { Router } from 'express';
import { CodingController } from '../controllers/coding.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Protect all coding routes
router.use(authenticateJWT);

router.get('/questions', CodingController.getQuestions);
router.get('/questions/:id', CodingController.getQuestionById);
router.post('/run', CodingController.runCode);
router.post('/submit', CodingController.submitCode);
router.get('/submissions', CodingController.getSubmissions);
router.post('/generate', CodingController.generateQuestion);

export default router;
