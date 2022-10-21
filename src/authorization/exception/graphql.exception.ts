import { MethodNotAllowedException } from '@nestjs/common';

export class MultipleArgumentException extends MethodNotAllowedException {
  constructor() {
    super(`Multiple graphql conditions not allowed`);
  }
}
