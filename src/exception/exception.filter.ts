import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch()
export class CustomExceptionsFilter implements GqlExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    Logger.error(exception);
    const contextType = host.getType();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      typeof exception.message === 'string'
        ? exception.message
        : exception.message.message;

    const error = exception.response?.error || 'Internal Server Error';

    const errorResponse = {
      statusCode: statusCode,
      message: message || 'Something went wrong',
      error: error,
    };

    if (contextType == 'http') {
      const httpHost = host.switchToHttp();
      const response = httpHost.getResponse<Response>();
      response.status(statusCode).json(errorResponse);
    } else {
      return new HttpException(errorResponse, statusCode);
    }
  }
}
