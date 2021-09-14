import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GoogleAuthService } from '../service/google.service';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../common/logger/logger.service';

@Controller('google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private logger: LoggerService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    this.logger.info('Redirecting to google login');
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() request: any) {
    return this.googleAuthService.googleLogin(request.user);
  }
}
