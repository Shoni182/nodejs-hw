import { Joi, Segments } from 'celebrate';
import { TAGS } from '../constants/tags.js';

//^ Custom object ID
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalud id format') : value;
};

//^

//^ NoteId
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    studentId: Joi.string().custom(objectIdValidator).required(),
  }),
};

//^ GET all notes
export const getAllNotesSchema = {
  [Segments.BODY]: Joi.object({
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer.min(5).max(20),
    tag: Joi.string().valid(TAGS),
    search: Joi.string().trim().allow(''),
  }),
};

//^ POST note
export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().required().messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title should have at least 1 characters',
      'any.required': 'Title is required',
    }),
    content: Joi.string().allow('').messages({
      'string.base': 'Title must be a string',
    }),
    tag: Joi.string().valid(TAGS).messages({
      'any.only':
        'Tag must be one of: Work,Personal,Meeting,Shopping,Ideas,Travel,Finance,Health,Important,Todo',
    }),
  }),
};

//^ UPDATE note
export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    studentId: Joi.string().custom(objectIdValidator).required(),
  }),

  [Segments.BODY]: Joi.object({
    title: Joi.string().messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title should have at least 1 characters',
    }),
    content: Joi.string().allow('').messages({
      'string.base': 'Title must be a string',
    }),
    tag: Joi.string().valid(TAGS).messages({
      'any.only':
        'Tag must be one of: Work,Personal,Meeting,Shopping,Ideas,Travel,Finance,Health,Important,Todo',
    }),
  }).min(1),
};
