import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ObjectSchema } from '@hapi/joi';

@Injectable()
export default class ValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException('Validation failed', error.message);
    }
    return value;
  }
}
