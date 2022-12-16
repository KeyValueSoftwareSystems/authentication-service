import { NotFoundException, PreconditionFailedException } from '@nestjs/common';

export class PermissionNotFoundException extends NotFoundException {
  constructor(permissionId: string) {
    super(`Permission ${permissionId} not found`);
  }
}

export class PermissionDeleteNotAllowedException extends PreconditionFailedException {
  constructor() {
    super(`Permission cannot be deleted as it is already in use`);
  }
}
