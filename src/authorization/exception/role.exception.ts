import { NotFoundException, PreconditionFailedException } from '@nestjs/common';

export class RoleNotFoundException extends NotFoundException {
  constructor(roleId: string) {
    super(`Role ${roleId} not found`);
  }
}
export class RoleDeleteNotAllowedException extends PreconditionFailedException {
  constructor() {
    super(`Role cannot be deleted as it is already in use`);
  }
}
