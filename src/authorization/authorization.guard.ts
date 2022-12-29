import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { UserService } from './service/user.service';

@Injectable()
export class AuthorizationGaurd implements CanActivate {
  constructor(
    @Inject('UserService') private userService: UserService,
    private reflector: Reflector,
  ) {}
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
