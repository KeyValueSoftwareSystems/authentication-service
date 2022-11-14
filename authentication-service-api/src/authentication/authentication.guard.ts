import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationHelper } from './authentication.helper';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authenticationHelper: AuthenticationHelper) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (ctx) {
      const token = ctx.headers.authorization;
      if (token) {
        const reqAuthToken = token.split(' ')[1];
        ctx.user = this.authenticationHelper.validateAuthToken(reqAuthToken);
        return true;
      }
    }
    return false;
  }
}
