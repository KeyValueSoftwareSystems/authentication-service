import { NotFoundException, PreconditionFailedException } from '@nestjs/common';

export class RoleNotFoundException extends NotFoundException {
  constructor(roleId: string) {
    super(`Role ${roleId} not found`);
  }
}
export class RoleDeleteNotAllowedException extends PreconditionFailedException {
  constructor(roleId: string) {
    super(`Role ${roleId} cannot be deleted`);
  }
}
