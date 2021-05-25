import { Body, Controller, Post } from '@nestjs/common';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GoogleService } from './google.service';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post()
  create(@Body() googleLoginDto: GoogleLoginDto) {
    return this.googleService.login(googleLoginDto);
  }
}
