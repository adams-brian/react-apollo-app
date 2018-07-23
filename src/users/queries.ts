import { gql } from 'apollo-boost';
import { MutationFunc } from 'react-apollo';

export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
}

interface IAddTypename {
  __typename: string;
}

export const UsersQuery = gql`
  query {
    users {
      id
      firstname
      lastname
    }
  }
`;
export interface IUsersQueryResponse {
  users: IUser[];
}

export const UserQuery = gql`
  query user ( $id: ID! ) {
    user( id: $id ) {
      id
      firstname
      lastname
    }
  }
`;
export interface IUserVariables {
  id: string;
}
export interface IUserQueryResponse {
  user: IUser;
}

export const CREATE_USER_TEMP_ID = "[TEMPORARY ID]";
export const CreateUserMutation = gql`
  mutation createUser( $firstname: String!, $lastname: String! ) {
    createUser( firstname: $firstname, lastname: $lastname ) {
      id
      firstname
      lastname
    }
  }
`;
export interface ICreateUserVariables {
  firstname: string;
  lastname: string;
}
export interface ICreateUserResponse {
  createUser: IUser & IAddTypename;
}
export type TCreateUserFunc = MutationFunc<ICreateUserResponse, ICreateUserVariables>;

export const UpdateUserMutation = gql`
  mutation updateUser( $id: ID!, $firstname: String!, $lastname: String! ) {
    updateUser(id: $id, firstname: $firstname, lastname: $lastname) {
      id
      firstname
      lastname
    }
  }
`;
export interface IUpdateUserResponse {
  updateUser: IUser & IAddTypename;
}
export type TUpdateUserFunc = MutationFunc<IUpdateUserResponse, IUser>;

export const DeleteUserMutation = gql`
  mutation deleteUser( $id: ID! ) {
    deleteUser( id: $id ) {
      id
    }
  }
`;
export interface IDeleteUserVariables {
  id: string;
}
export interface IDeleteUserResponse {
  deleteUser: {
    id: string
  } & IAddTypename;
}
export type TDeleteUserFunc = MutationFunc<IDeleteUserResponse, IDeleteUserVariables>;
