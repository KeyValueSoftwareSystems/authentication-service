import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { validateAuthToken } from './userauth.common';

@Injectable()
export class AuthGaurd implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (ctx) {
      ctx.user = validateAuthToken(ctx);
      return true;
    }
    return false;
  }
}
