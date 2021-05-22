import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionsFilter } from './exception/exception.filter';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  const logger = LoggerService.getInstance('bootstrap()');
  app.setGlobalPrefix('auth/api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new CustomExceptionsFilter());

  await app.listen(4000);

  logger.info(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
