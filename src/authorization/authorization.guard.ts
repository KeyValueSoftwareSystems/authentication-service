import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import UserService from './service/user.service';

@Injectable()
export class AuthorizationGaurd implements CanActivate {
  constructor(private userService: UserService, private reflector: Reflector) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const permissionsRequired = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    const userId = ctx.user.id;
    const verified = await this.userService.verifyUserPermissions(
      userId,
      permissionsRequired,
    );
    return verified;
  }
}
