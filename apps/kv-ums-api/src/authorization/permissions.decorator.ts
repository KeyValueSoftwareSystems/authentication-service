import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../authentication/authentication.guard';
import { OperationType } from '../schema/graphql.schema';
import { AuthorizationGaurd } from './authorization.guard';

export const Permissions = (...permissions: string[]) => {
  return applyDecorators(
    UseGuards(AuthGuard, AuthorizationGaurd),
    SetMetadata('permissions', permissions),
    SetMetadata('operationType', OperationType.AND),
  );
};
