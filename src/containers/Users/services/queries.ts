import {gql} from '@apollo/client';

export const GET_USERS = gql`query
getUsers  {
    getUsers {
        id,
        email,
        firstName,
    }
}`