import {
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import UserAuthService from '../service/user.auth.service';
import { toFileStream } from 'qrcode';
import { AuthGuard } from '../authentication.guard';
import { Context } from '@nestjs/graphql';
import ValidationPipe from '../../validation/validation.pipe';
import { UserOtpLoginInputSchema } from '../validation/user.auth.schema.validation';

@Controller('2fa')
export class TwoFAController {
  constructor(private userAuthService: UserAuthService) {}

  @Post('generate/:id')
  @UseGuards(AuthGuard)
  async generate2FA(@Req() request: any, @Res() response: any) {
    const data = await this.userAuthService.generate2FACode(request.params.id);
    return toFileStream(response, data);
  }

  @Post('enable')
  @UseGuards(AuthGuard)
  async enable2FA(@Req() request: any, @Context('user') user: any) {
    const {
      body: { code },
    } = request;
    const data = await this.userAuthService.enable2FA(code, user.id);
    return true;
  }

  @Post('login')
  @UsePipes(new ValidationPipe(UserOtpLoginInputSchema))
  async loginWith2FA(@Req() request: any) {
    const {
      body: { code, username },
    } = request;
    await this.userAuthService.loginWith2FA(code, username);
  }
}
