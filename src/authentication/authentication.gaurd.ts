import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationHelper } from './authentication.helper';

@Injectable()
export class AuthGaurd implements CanActivate {
  constructor(private authenticationHelper: AuthenticationHelper) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (ctx) {
      const reqAuthToken = ctx.headers.authorization.split(' ')[1];
      ctx.user = this.authenticationHelper.validateAuthToken(reqAuthToken);
      return true;
    }
    return false;
  }
}
