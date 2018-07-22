import { History } from 'history';
import * as React from 'react';
import { graphql } from 'react-apollo';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { branch, mapProps, renderComponent } from 'recompose';

import Loading from '../common/loading';
import { CREATE_USER_TEMP_ID, DeleteUserMutation,
  IDeleteUserResponse, IDeleteUserVariables, IUser,
  IUsersQueryResponse, TDeleteUserFunc, UsersQuery } from './queries';
import UserListRow from './userListRow';

interface IProps {
  deleteUser: TDeleteUserFunc;
  history: History;
  users: IUser[];
}

class UserList extends React.Component<IProps, {}> {

  public render() {
    return (
      <div className="users-container">
        <h1 className="users-header">Users</h1>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th style={{width: '1px'}}/>
            </tr>
          </thead>
          <tbody>
            {this.props.users.map(user =>
              <UserListRow 
                key={user.id}
                user={user}
                editUser={this.editUser}
                deleteUser={this.deleteUser}
              />
            )}
          </tbody>
        </table>
        <Link className="create-user" to="/users/createuser">
          <button type="button" className="btn btn-primary">Create User</button>
        </Link>
      </div>
    );
  }

  private deleteUser = (id: string) => {
    // don't do anything if this is a temp id for a newly created user
    if(id === CREATE_USER_TEMP_ID) {
      return;
    }
    this.props.deleteUser({
      optimisticResponse: {
        deleteUser: { id, __typename: 'User' }
      },
      update: (store, data) => {
        if (data && data.data && data.data.deleteUser && data.data.deleteUser.id) {
          const deletedId = data.data.deleteUser.id;
          const users = store.readQuery<IUsersQueryResponse>({ query: UsersQuery });
          const list = users && users.users ? users.users : [];
          store.writeQuery({
            data: {
              users: list.filter(u => u.id !== deletedId)
            },
            query: UsersQuery
          });
        }
      },
      variables: { id }
    });
  }
  private editUser = (id: string) => {
    // don't do anything if this is a temp id for a newly created user
    if(id === CREATE_USER_TEMP_ID) {
      return;
    }
    this.props.history.push('/users/' + id);
  }
}

export default
withRouter(
  mapProps(
    (props: RouteComponentProps<{}>) => ({ history: props.history })
  )(
    graphql<{ history: History }, IUsersQueryResponse, {}, { history: History, loading: boolean, users: IUser[] }>(UsersQuery, {
      props: (props) => ({
        history: props.ownProps.history,
        loading: props.data === undefined || props.data.loading,
        users: props.data !== undefined && props.data.users !== undefined ? props.data.users : [],
      })
    })(
      branch((props: { history: History, loading: boolean, users: IUser[] }) => props.loading,
        renderComponent(Loading)
      )(
        mapProps((props: { history: History, loading: boolean, users: IUser[] }) => ({
          history: props.history,
          users: props.users
        }))(
          graphql<{ history: History, users: IUser[] }, IDeleteUserResponse, IDeleteUserVariables, IProps> (DeleteUserMutation, {
            props: (props) => ({
              deleteUser: props.mutate!,
              history: props.ownProps.history,
              users: props.ownProps.users
            })
          })(
            UserList
          )
        )
      )
    )
  )
);
