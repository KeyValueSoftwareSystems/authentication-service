import * as Joi from '@hapi/joi';

export const UserPasswordSignupInputSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }),
  phone: Joi.number(),
  password: Joi.string().required().min(10),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('', null),
  lastName: Joi.string().required(),
})
  .options({ abortEarly: false })
  .or('email', 'phone');

export const UserOTPSignupInputSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }),
  phone: Joi.number().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string(),
  lastName: Joi.string().required(),
}).options({ abortEarly: false });

export const UserPasswordLoginInputSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(10).required(),
}).options({ abortEarly: false });

export const UserOTPLoginInputSchema = Joi.object({
  username: Joi.string().required(),
  otp: Joi.string().required(),
}).options({ abortEarly: false });

export const UserSendOTPInputSchema = Joi.object({
  username: Joi.string().required(),
}).options({ abortEarly: false });

export const UserPasswordInputSchema = Joi.object({
  currentPassword: Joi.string().required().min(10),
  newPassword: Joi.string()
    .disallow(Joi.ref('currentPassword'))
    .required()
    .min(10),
}).options({ abortEarly: false });

export const GoogleUserSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  firstName: Joi.string().required(),
  middleName: Joi.string(),
  lastName: Joi.string().required(),
  externalUserId: Joi.string().required(),
}).options({ abortEarly: false });

export const GenerateOtpInputSchema = Joi.object({
  phone: Joi.string().trim().required(),
});

export const Enable2FAInputSchema = Joi.object({
  code: Joi.string().trim().required(),
});

export const EnableUser2FASchema = Joi.object({
  phone: Joi.string().trim(),
  email: Joi.string().trim(),
}).xor('phone', 'email');
