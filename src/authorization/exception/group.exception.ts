import {
  BadRequestException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';

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

export class GroupExistsException extends BadRequestException {
  constructor(name: string) {
    super(`Group with name ${name} already exists. Cannot create this group.`);
  }
}
