import { ObjectSchema } from '@hapi/joi';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export default class ValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value === 'undefined') {
      throw new BadRequestException('Validation failed', 'No payload provided');
    }

    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return value;
  }
}
