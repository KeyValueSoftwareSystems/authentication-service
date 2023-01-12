import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserServiceInterface } from './service/user.service.interface';

@Injectable()
export class AuthorizationGaurd implements CanActivate {
  constructor(
    @Inject(UserServiceInterface) private userService: UserServiceInterface,
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
