import * as Joi from '@hapi/joi';

export const UpdateUserSchema = Joi.object({
  firstName: Joi.string(),
  middleName: Joi.string(),
  lastName: Joi.string(),
  active: Joi.boolean(),
  groups: Joi.array(),
}).options({ abortEarly: false });
