import { ForbiddenException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User ${userId} not found`);
  }
}

export class InactiveAccountException extends ForbiddenException {
  constructor() {
    super(`Account is inactive`);
  }
}
