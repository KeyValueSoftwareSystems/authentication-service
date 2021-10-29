import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import User from '../../authorization/entity/user.entity';

export class UserExistsException extends BadRequestException {
  constructor(user: User, duplicate: string) {
    super(
      `User with ${duplicate}: ${
        duplicate === 'email' ? user.email : user.phone
      } exits. Cannot signup this user.`,
    );
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

export class GoogleSetupError extends BadRequestException {
  constructor() {
    super({
      error: 'Google login is not supported.',
    });
  }
}
