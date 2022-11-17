import { NotFoundException } from '@nestjs/common';

export class EntityNotFoundException extends NotFoundException {
  constructor(entityId: string) {
    super(`Entity ${entityId} not found`);
  }
}
