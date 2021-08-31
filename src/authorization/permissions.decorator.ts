import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/authentication/authentication.guard';
import { OperationType } from 'src/schema/graphql.schema';
import { AuthorizationGaurd } from './authorization.guard';

export const Permissions = (...permissions: string[]) => {
  return applyDecorators(
    UseGuards(AuthGuard, AuthorizationGaurd),
    SetMetadata('permissions', permissions),
    SetMetadata('operationType', OperationType.AND),
  );
};
