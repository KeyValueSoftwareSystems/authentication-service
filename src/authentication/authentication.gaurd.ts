import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationHelper } from './authentication.helper';

@Injectable()
export class AuthGaurd implements CanActivate {
  constructor(private authenticationHelper: AuthenticationHelper) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (ctx) {
      ctx.user = this.authenticationHelper.validateAuthToken(ctx);
      return true;
    }
    return false;
  }
}
