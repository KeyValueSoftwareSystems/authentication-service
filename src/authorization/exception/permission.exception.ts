import { NotFoundException } from '@nestjs/common';

export class PermissionNotFoundException extends NotFoundException {
  constructor(permissionId: string) {
    super(`Permission ${permissionId} not found`);
  }
}
