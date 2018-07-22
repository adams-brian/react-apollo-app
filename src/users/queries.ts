import { gql } from 'apollo-boost';
import { MutationFunc } from 'react-apollo';

export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
}

export interface IUserResponse extends IUser {
  __typename: 'User';
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
  users: IUserResponse[];
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
  user: IUserResponse;
}

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
  createUser: IUserResponse;
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
  updateUser: IUserResponse;
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
    __typename: string,
    id: string
  };
}
export type TDeleteUserFunc = MutationFunc<IDeleteUserResponse, IDeleteUserVariables>;
