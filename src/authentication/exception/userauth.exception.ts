import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class UserExistsException extends BadRequestException {
  constructor(username: string) {
    super(`User with username: ${username} exits. Cannot signup this user.`);
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      error: 'Invalid credentials',
    });
  }
}

export class InvalidPayloadException extends BadRequestException {
  constructor(message: string) {
    super({
      error: message,
    });
  }
}
