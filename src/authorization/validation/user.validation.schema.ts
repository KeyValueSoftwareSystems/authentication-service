import * as Joi from '@hapi/joi';

export const UpdateUserSchema = Joi.object({
  firstName: Joi.string().regex(/^[a-zA-Z ]*$/),
  middleName: Joi.string().regex(/^[a-zA-Z ]*$/),
  lastName: Joi.string().regex(/^[a-zA-Z ]*$/),
  active: Joi.boolean(),
  groups: Joi.array(),
}).options({ abortEarly: false });
