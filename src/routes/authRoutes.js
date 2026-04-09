import { Router } from 'express';
import { celebrate } from 'celebrate';

const router = Router();

router.post('/auth/register', celebrate(), registerUser);
router.post('/auth/login', celebrate(), loginUser);
router.post('/auth/logout', logoutUser);

export default router;
