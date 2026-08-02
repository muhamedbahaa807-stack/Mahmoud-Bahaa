import { Router } from 'express';
import authrouter from './authRoute.js';
import graderouter from './GradeRouter.js';
import studentrouter from './studentRouter.js';
const router = Router();
router.use(authrouter);
router.use(graderouter);
router.use(studentrouter);
export default router;
