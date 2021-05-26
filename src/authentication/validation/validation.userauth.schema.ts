import * as Joi from '@hapi/joi';

export const UserSignupInputSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }),
  phone: Joi.number(),
  password: Joi.string().required().min(10),
  firstName: Joi.string().required(),
  middleName: Joi.string(),
  lastName: Joi.string().required(),
})
  .options({ abortEarly: false })
  .or('email', 'phone');

export const UserLoginInputSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required().min(10),
}).options({ abortEarly: false });

export const UserPasswordInputSchema = Joi.object({
  currentPassword: Joi.string().required().min(10),
  newPassword: Joi.string()
    .disallow(Joi.ref('currentPassword'))
    .required()
    .min(10),
}).options({ abortEarly: false });
