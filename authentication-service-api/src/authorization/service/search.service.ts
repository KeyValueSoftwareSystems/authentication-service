import { Injectable } from '@nestjs/common';
import { Equal, FindOperator, ILike, Like } from 'typeorm';
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

  public generateSearchTermForEntity(
    entity: SearchEntity,
    input: UserSearchInput | GroupSearchInput | RoleSearchInput,
  ) {
    if (entity === SearchEntity.USER) {
      return this.generateSearchTermForUsers(input as UserSearchInput);
    } else if (entity === SearchEntity.GROUP) {
      return this.generateSearchTermForGroups(input as GroupSearchInput);
    } else if (entity === SearchEntity.ROLE) {
      return this.generateSearchTermForRole(input as RoleSearchInput);
    }

    return [];
  }

  private generateSearchTermForUsers(
    input: UserSearchInput,
  ): {
    [key: string]: FindOperator<string | undefined>;
  }[] {
    const searchWhereCondition = [];
    const andConditions: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (input.and) {
      if (input.and.email) {
        andConditions[`email`] = this.generateWhereClauseForStringSearch(
          input.and.email,
        );
      }
      if (input.and.firstName) {
        andConditions[`firstName`] = this.generateWhereClauseForStringSearch(
          input.and.firstName,
        );
      }
      if (input.and.middleName) {
        andConditions[`middleName`] = this.generateWhereClauseForStringSearch(
          input.and.middleName,
        );
      }
      if (input.and.lastName) {
        andConditions[`lastName`] = this.generateWhereClauseForStringSearch(
          input.and.lastName,
        );
      }
    }
    if (Object.keys(andConditions).length) {
      searchWhereCondition.push(andConditions);
    }

    if (input.or) {
      if (input.or.email) {
        searchWhereCondition.push({
          email: this.generateWhereClauseForStringSearch(input.or.email),
        });
      }
      if (input.or.firstName) {
        searchWhereCondition.push({
          firstName: this.generateWhereClauseForStringSearch(
            input.or.firstName,
          ),
        });
      }
      if (input.or.middleName) {
        searchWhereCondition.push({
          middleName: this.generateWhereClauseForStringSearch(
            input.or.middleName,
          ),
        });
      }
      if (input.or.lastName) {
        searchWhereCondition.push({
          lastName: this.generateWhereClauseForStringSearch(input.or.lastName),
        });
      }
    }
    return searchWhereCondition;
  }

  private generateSearchTermForGroups(
    input: GroupSearchInput,
  ): {
    [key: string]: FindOperator<string | undefined>;
  }[] {
    const searchWhereCondition = [];
    const andConditions: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (input.and) {
      if (input.and.name) {
        andConditions[`name`] = this.generateWhereClauseForStringSearch(
          input.and.name,
        );
      }
    }
    if (Object.keys(andConditions).length) {
      searchWhereCondition.push(andConditions);
    }

    if (input.or) {
      if (input.or.name) {
        searchWhereCondition.push({
          name: this.generateWhereClauseForStringSearch(input.or.name),
        });
      }
    }
    return searchWhereCondition;
  }

  private generateSearchTermForRole(
    input: RoleSearchInput,
  ): {
    [key: string]: FindOperator<string | undefined>;
  }[] {
    const searchWhereCondition = [];
    const andConditions: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (input.and) {
      if (input.and.name) {
        andConditions[`name`] = this.generateWhereClauseForStringSearch(
          input.and.name,
        );
      }
    }
    if (Object.keys(andConditions).length) {
      searchWhereCondition.push(andConditions);
    }

    if (input.or) {
      if (input.or.name) {
        searchWhereCondition.push({
          name: this.generateWhereClauseForStringSearch(input.or.name),
        });
      }
    }
    return searchWhereCondition;
  }

  public generateWhereClauseForStringSearch(
    input: StringSearchCondition,
  ): FindOperator<string | undefined> {
    if (input.contains) {
      return ILike(`%${input.contains}%`);
    } else if (input.equals) {
      return Equal(input.equals);
    } else {
      return Like(`%%`);
    }
  }
}
