import { NotFoundException, PreconditionFailedException } from '@nestjs/common';

export class GroupNotFoundException extends NotFoundException {
  constructor(groupId: string) {
    super(`Group ${groupId} not found`);
  }
}
export class GroupDeleteNotAllowedException extends PreconditionFailedException {
  constructor() {
    super(`Group cannot be deleted as it is already in use`);
  }
}
