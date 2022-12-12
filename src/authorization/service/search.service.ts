import { Injectable } from '@nestjs/common';
import { Equal, FindOperator, ILike, Like, SelectQueryBuilder } from 'typeorm';
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

  public generateSearchTermForEntity<T>(
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

  private generateSearchTermForUsers<T>(
    qb: SelectQueryBuilder<T>,
    input: UserSearchInput,
  ): SelectQueryBuilder<T> {
    const searchWhereCondition = [];
    const andConditions: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (input.and) {
      if (input.and.email) {
        this.generateWhereClauseForStringSearch(
          'User.email',
          qb,
          input.and.email,
        );
      }
      if (input.and.firstName) {
        this.generateWhereClauseForStringSearch(
          'User.firstName',
          qb,
          input.and.firstName,
        );
      }
      if (input.and.middleName) {
        this.generateWhereClauseForStringSearch(
          'User.middleName',
          qb,
          input.and.middleName,
        );
      }
      if (input.and.lastName) {
        this.generateWhereClauseForStringSearch(
          'User.lastName',
          qb,
          input.and.lastName,
        );
      }
    }
    if (Object.keys(andConditions).length) {
      searchWhereCondition.push(andConditions);
    }

    if (input.or) {
      if (input.or.email) {
        this.generateWhereClauseForStringSearch(
          'User.email',
          qb,
          input.or.email,
        );
      }
      if (input.or.firstName) {
        this.generateWhereClauseForStringSearch(
          'User.firstName',
          qb,
          input.or.firstName,
        );
      }
      if (input.or.middleName) {
        this.generateWhereClauseForStringSearch(
          'User.middleName',
          qb,
          input.or.middleName,
        );
      }
      if (input.or.lastName) {
        this.generateWhereClauseForStringSearch(
          'User.lastName',
          qb,
          input.or.lastName,
        );
      }
    }
    return qb;
  }

  private generateSearchTermForGroups<T>(
    qb: SelectQueryBuilder<T>,
    input: GroupSearchInput,
  ): SelectQueryBuilder<T> {
    const searchWhereCondition = [];
    const andConditions: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (input.and) {
      if (input.and.name) {
        this.generateWhereClauseForStringSearch('name', qb, input.and.name);
      }
    }
    if (Object.keys(andConditions).length) {
      searchWhereCondition.push(andConditions);
    }

    if (input.or) {
      if (input.or.name) {
        searchWhereCondition.push({
          name: this.generateWhereClauseForStringSearch(
            'name',
            qb,
            input.or.name,
          ),
        });
      }
    }
    return qb;
  }

  private generateSearchTermForRole<T>(
    qb: SelectQueryBuilder<T>,
    input: RoleSearchInput,
  ): SelectQueryBuilder<T> {
    if (input.and) {
      if (input.and.name) {
        qb = this.generateWhereClauseForStringSearch(
          `name`,
          qb,
          input.and.name,
        );
      }
    }

    if (input.or) {
      if (input.or.name) {
        qb = this.generateWhereClauseForStringSearch('name', qb, input.or.name);
      }
    }
    return qb;
  }

  public generateWhereClauseForStringSearch<T>(
    field: string,
    qb: SelectQueryBuilder<T>,
    input: StringSearchCondition,
  ): SelectQueryBuilder<T> {
    if (input.contains) {
      return qb.andWhere(field + ' ' + `ILIKE('%${input.contains}%')`);
    } else {
      return qb.andWhere(field + ' ' + `ILIKE('%${input.equals}%')`);
    }
  }
}
