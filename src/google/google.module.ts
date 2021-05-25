import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';

@Module({
  controllers: [GoogleController],
  providers: [GoogleService, ConfigService],
})
export class GoogleModule {}
