import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getSupportedLanguages, translateFormUI } from '../controllers/translationController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/languages', getSupportedLanguages);
router.post('/form-ui', translateFormUI);

export default router;
