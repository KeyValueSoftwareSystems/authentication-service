import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationHelper } from './authentication.helper';

@Injectable()
export class RestAuthGuard implements CanActivate {
  constructor(private authenticationHelper: AuthenticationHelper) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const req = await this.authenticationHelper.validateAuthToken(
      ctx.headers.authorization.split(' ')[1],
    );
    if (!(req instanceof UnauthorizedException)) {
      return true;
    } else {
      throw req;
    }
  }
}
