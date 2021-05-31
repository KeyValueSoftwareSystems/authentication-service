import * as Joi from '@hapi/joi';

export const CreateUserSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }),
  firstName: Joi.string().required(),
  middleName: Joi.string(),
  lastName: Joi.string().required(),
  groups: Joi.array(),
}).options({ abortEarly: false });

export const UpdateUserSchema = Joi.object({
  firstName: Joi.string(),
  middleName: Joi.string(),
  lastName: Joi.string(),
  active: Joi.boolean(),
  groups: Joi.array(),
}).options({ abortEarly: false });
