import { BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User ${userId} not found`);
  }
}

export class AccountIsInactive extends BadRequestException {
  constructor() {
    super(`Account is inactive`);
  }
}
