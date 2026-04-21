import { Router } from 'express';
import { requestResetEmailSchema } from '../validations/authValidation';

const router = Router();

router.post('/auth/request-reset-email', requestResetEmailSchema);
