import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionsFilter } from './exception/exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('auth/api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new CustomExceptionsFilter());

  await app.listen(configService.get('PORT') || 4000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
