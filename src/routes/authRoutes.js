import { Router } from 'express';
import { celebrate } from 'celebrate';
//: Schema
import {
  registerUserSchema,
  loginUserSchema,
  resetPasswordSchema,
  requestResetEmailSchema,
} from '../validations/authValidation.js';

//: Routs
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  resetPassword,
  requestResetEmail,
} from '../controllers/authController.js';

const router = Router();

router.post('/auth/register', celebrate(registerUserSchema), registerUser);
router.post('/auth/login', celebrate(loginUserSchema), loginUser);
router.post('/auth/logout', logoutUser);
router.post('/auth/refresh', refreshUserSession);
router.post('/auth/request-reset-email', celebrate(requestResetEmailSchema), requestResetEmail);
router.post('/auth/reset-password', celebrate(resetPasswordSchema), resetPassword);

export default router;
