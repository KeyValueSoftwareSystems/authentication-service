import * as Joi from '@hapi/joi';
import { ExceptionMessage } from '../../../src/constants/exception.message';

export const UpdateUserSchema = Joi.object({
  firstName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .label('First name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
    }),
  middleName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .label('Middle name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
    }),
  lastName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .label('Last name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
    }),
  groups: Joi.array(),
}).options({ abortEarly: false });
