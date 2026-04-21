import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

//^ register
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

//^ login
export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

//^ requestResetEmailSchema
export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
  }),
};

//^ Reset Password

export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().required(),
    token: Joi.string().required(),
  }),
};
