import * as Joi from '@hapi/joi';
import { ExceptionMessage } from '../../../src/constants/exception.message';

export const UserPasswordSignupInputSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      'string.email': ExceptionMessage.INVALID_EMAIL_ERROR,
    }),
  phone: Joi.number().messages({
    'number.base': ExceptionMessage.INVALID_PHONE_ERROR,
  }),
  password: Joi.string().required().min(10).label('Password').messages({
    'string.min': ExceptionMessage.PASSWORD_MIN_CHAR_LENGTH_ERROR,
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
  firstName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('First name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
  middleName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .allow('', null)
    .label('Middle name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
    }),
  lastName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('Last name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
})
  .options({ abortEarly: false })
  .or('email', 'phone');

export const UserOTPSignupInputSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      'string.email': ExceptionMessage.INVALID_EMAIL_ERROR,
    }),
  phone: Joi.number().required().messages({
    'number.base': ExceptionMessage.INVALID_PHONE_ERROR,
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
  firstName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('First name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
  middleName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .label('Middle name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
    }),
  lastName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('Last name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
}).options({ abortEarly: false });

export const UserPasswordLoginInputSchema = Joi.object({
  username: Joi.string().required().label('Username').messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
  password: Joi.string().min(10).required().label('Password').messages({
    'string.min': ExceptionMessage.PASSWORD_MIN_CHAR_LENGTH_ERROR,
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
}).options({ abortEarly: false });

export const UserOTPLoginInputSchema = Joi.object({
  username: Joi.string().required().label('Username').messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
  otp: Joi.string().required().label('OTP').messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
}).options({ abortEarly: false });

export const UserSendOTPInputSchema = Joi.object({
  username: Joi.string().required().label('Username').messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
}).options({ abortEarly: false });

export const UserPasswordInputSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .min(10)
    .label('Current Password')
    .messages({
      'string.min': ExceptionMessage.PASSWORD_MIN_CHAR_LENGTH_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
  newPassword: Joi.string()
    .disallow(Joi.ref('currentPassword'))
    .required()
    .min(10)
    .label('New Password')
    .messages({
      'any.invalid': ExceptionMessage.NEW_PASSWORD_MATCH_CURRENT_PASSWORD_ERROR,
      'string.min': ExceptionMessage.PASSWORD_MIN_CHAR_LENGTH_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
}).options({ abortEarly: false });

export const GoogleUserSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label('Email')
    .messages({
      'string.email': ExceptionMessage.INVALID_EMAIL_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
  firstName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('First name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
  middleName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .label('Middle name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
    }),
  lastName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('Last name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
  externalUserId: Joi.string().required().label('External User Id').messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
}).options({ abortEarly: false });

export const GenerateOtpInputSchema = Joi.object({
  phone: Joi.string().trim().required().messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
});

export const Enable2FAInputSchema = Joi.object({
  code: Joi.string().trim().required().label('Code').messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
});

export const EnableUser2FASchema = Joi.object({
  phone: Joi.string().trim(),
  email: Joi.string().trim(),
}).xor('phone', 'email');

export const UserInviteTokenSignupInputSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      'string.email': ExceptionMessage.INVALID_EMAIL_ERROR,
    }),
  phone: Joi.number(),
  firstName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('First name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
  middleName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .allow('', null)
    .label('Middle name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
    }),
  lastName: Joi.string()
    .regex(/^[a-zA-Z ]*$/)
    .required()
    .label('Last name')
    .messages({
      'string.pattern.base': ExceptionMessage.CHAR_ONLY_ERROR,
      'any.required': ExceptionMessage.REQUIRED_ERROR,
    }),
})
  .options({ abortEarly: false })
  .or('email', 'phone');

export const UserPasswordForInviteInputSchema = Joi.object({
  inviteToken: Joi.string().required().label('Invite Token').messages({
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
  password: Joi.string().required().min(10).label('Password').messages({
    'string.min': ExceptionMessage.PASSWORD_MIN_CHAR_LENGTH_ERROR,
    'any.required': ExceptionMessage.REQUIRED_ERROR,
  }),
}).options({ abortEarly: false });
