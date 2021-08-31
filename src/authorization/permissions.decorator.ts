import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGaurd } from 'src/authentication/authentication.gaurd';
import { OperationType } from 'src/schema/graphql.schema';
import { AuthorizationGaurd } from './authorization.guard';

export const Permissions = (...permissions: string[]) => {
  return applyDecorators(
    UseGuards(AuthGaurd, AuthorizationGaurd),
    SetMetadata('permissions', permissions),
    SetMetadata('operationType', OperationType.AND),
  );
};
