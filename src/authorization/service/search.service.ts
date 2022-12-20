import { Injectable } from '@nestjs/common';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { SearchEntity } from '../../constants/search.entity.enum';
import {
  GroupSearchInput,
  RoleSearchInput,
  StringSearchCondition,
  UserSearchInput,
} from '../../schema/graphql.schema';

@Injectable()
export default class SearchService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public generateSearchTermForEntity<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    entity: SearchEntity,
    input: UserSearchInput | GroupSearchInput | RoleSearchInput,
  ): SelectQueryBuilder<T> {
    if (entity === SearchEntity.USER) {
      return this.generateSearchTermForUsers(qb, input as UserSearchInput);
    } else if (entity === SearchEntity.GROUP) {
      return this.generateSearchTermForGroups(qb, input as GroupSearchInput);
    } else {
      return this.generateSearchTermForRole(qb, input as RoleSearchInput);
    }
  }

  private generateSearchTermForUsers<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    input: UserSearchInput,
  ): SelectQueryBuilder<T> {
    const andConditions: string[] = [];
    const orConditions: string[] = [];
    if (input.and) {
      if (input.and.email) {
        andConditions.push(
          this.generateWhereClauseForStringSearch(
            'User.email',
            input.and.email,
          ),
        );
      }
      if (input.and.firstName) {
        andConditions.push(
          this.generateWhereClauseForStringSearch(
            'User.firstName',
            input.and.firstName,
          ),
        );
      }
      if (input.and.middleName) {
        andConditions.push(
          this.generateWhereClauseForStringSearch(
            'User.middleName',
            input.and.middleName,
          ),
        );
      }
      if (input.and.lastName) {
        andConditions.push(
          this.generateWhereClauseForStringSearch(
            'User.lastName',
            input.and.lastName,
          ),
        );
      }
    }

    if (input.or) {
      if (input.or.email) {
        orConditions.push(
          this.generateWhereClauseForStringSearch('User.email', input.or.email),
        );
      }
      if (input.or.firstName) {
        orConditions.push(
          this.generateWhereClauseForStringSearch(
            'User.firstName',
            input.or.firstName,
          ),
        );
      }
      if (input.or.middleName) {
        orConditions.push(
          this.generateWhereClauseForStringSearch(
            'User.middleName',
            input.or.middleName,
          ),
        );
      }
      if (input.or.lastName) {
        orConditions.push(
          this.generateWhereClauseForStringSearch(
            'User.lastName',
            input.or.lastName,
          ),
        );
      }
    }
    if (orConditions.length) {
      qb.andWhere(new Brackets((q) => orConditions.map((x) => q.orWhere(x))));
    }
    if (andConditions.length) {
      qb.andWhere(new Brackets((q) => andConditions.map((x) => q.andWhere(x))));
    }
    return qb;
  }

  private generateSearchTermForGroups<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    input: GroupSearchInput,
  ): SelectQueryBuilder<T> {
    const andConditions: string[] = [];
    const orConditions: string[] = [];
    if (input.and) {
      if (input.and.name) {
        andConditions.push(
          this.generateWhereClauseForStringSearch('name', input.and.name),
        );
      }
    }

    if (input.or) {
      if (input.or.name) {
        orConditions.push(
          this.generateWhereClauseForStringSearch('name', input.or.name),
        );
      }
    }
    if (orConditions.length) {
      qb.andWhere(new Brackets((q) => orConditions.map((x) => q.orWhere(x))));
    }
    if (andConditions.length) {
      qb.andWhere(new Brackets((q) => andConditions.map((x) => q.andWhere(x))));
    }
    return qb;
  }

  private generateSearchTermForRole<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    input: RoleSearchInput,
  ): SelectQueryBuilder<T> {
    const andConditions: string[] = [];
    const orConditions: string[] = [];
    if (input?.and?.name) {
      andConditions.push(
        this.generateWhereClauseForStringSearch(`name`, input.and.name),
      );
    }

    if (input?.or?.name) {
      orConditions.push(
        this.generateWhereClauseForStringSearch('name', input.or.name),
      );
    }

    if (orConditions.length) {
      qb.andWhere(new Brackets((q) => orConditions.map((x) => q.orWhere(x))));
    }
    if (andConditions.length) {
      qb.andWhere(new Brackets((q) => andConditions.map((x) => q.andWhere(x))));
    }
    return qb;
  }

  public generateWhereClauseForStringSearch(
    field: string,
    input: StringSearchCondition,
  ): string {
    return field + ' ' + `ILIKE('%${input.contains}%')`;
  }
}
