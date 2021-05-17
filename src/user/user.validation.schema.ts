import * as Joi from '@hapi/joi';

export const UserSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }),
  firstName: Joi.string(),
  middleName: Joi.string(),
  lastName: Joi.string(),
});
