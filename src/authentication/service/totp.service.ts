import { Injectable } from '@nestjs/common';
import UserService from '../../authorization/service/user.service';
import { ConfigService } from '@nestjs/config';
import User from '../../authorization/entity/user.entity';
import { authenticator } from 'otplib';


@Injectable()
export class TotpService{
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}


}
