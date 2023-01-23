import { ExceptionType } from './exception.message.enum';

export const ExceptionMessage: { [key in ExceptionType]: string } = {
  [ExceptionType.CHAR_ONLY_ERROR]: '{{#label}} should contain only characters',
  [ExceptionType.REQUIRED_ERROR]: '{{#label}} is mandatory',
  [ExceptionType.INVALID_EMAIL_ERROR]: 'Invalid email address',
  [ExceptionType.INVALID_PHONE_ERROR]: 'Invalid phone number',
  [ExceptionType.PASSWORD_MIN_CHAR_LENGTH_ERROR]:
    '{{#label}} should have a minimum of 10 characters',
  [ExceptionType.NEW_PASSWORD_MATCH_CURRENT_PASSWORD_ERROR]:
    'New Password should not match the current password',
};
