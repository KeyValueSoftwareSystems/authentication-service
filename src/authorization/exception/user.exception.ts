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
export class InviteTokenAlreadyRevokedException extends NotAcceptableException {
  constructor(userId: string) {
    super(`Invite token for ${userId} is already revoked`);
  }
}
