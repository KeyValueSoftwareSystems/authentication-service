// import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
// import { toFileStream } from 'qrcode';
// import { RestAuthGuard } from '../rest.authentication.guard';

// @Controller('2fa')
// export class TwoFAController {
//   constructor(private userAuthService: UserAuthService) {}

//   @Post('generate/:id')
//   @UseGuards(RestAuthGuard)
//   async generate2FA(@Req() request: any, @Res() response: any) {
//     const data = await this.userAuthService.generate2FACode(request.params.id);
//     return toFileStream(response, data);
//   }
// }
