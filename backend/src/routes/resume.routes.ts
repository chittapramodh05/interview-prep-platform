import { Router } from 'express';
import multer from 'multer';
import { ResumeController } from '../controllers/resume.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF resumes are supported.'));
    }
  }
});

// Protect all resume routes
router.use(authenticateJWT);

router.post('/upload', upload.single('resume'), ResumeController.uploadResume);
router.get('/history', ResumeController.getHistory);
router.get('/report/:id', ResumeController.getReport);

export default router;
