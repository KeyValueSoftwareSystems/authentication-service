import { NotAcceptableException, NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User ${userId} not found`);
  }
}

export class PasswordAlreadySetException extends NotAcceptableException {
  constructor(userId: string) {
    super(`Password for ${userId} already set`);
  }
}
