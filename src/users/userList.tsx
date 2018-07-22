import { History } from 'history';
import * as React from 'react';
import { graphql } from 'react-apollo';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { mapProps } from 'recompose';

import Loading from '../common/loading';
import { DeleteUserMutation, IDeleteUserResponse, IDeleteUserVariables,
  IUsersQueryResponse, TDeleteUserFunc, TUsersData, UsersQuery } from './queries';
import UserListRow from './userListRow';

interface IProps {
  history: History;
  data: TUsersData;
  deleteUser: TDeleteUserFunc
}

class UserList extends React.Component<IProps, {}> {

  public render() {
    if (this.props.data.loading) {
      return <Loading />;
    }
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
            {this.users.map(user =>
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

  private get users() {
    return this.props.data.users || [];
  }
  private deleteUser = (id: string) => {
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
    this.props.history.push('/users/' + id);
  }
}

export default
withRouter(
  mapProps(
    (props: RouteComponentProps<{}>) => ({ history: props.history })
  )(
    graphql<{ history: History }, IUsersQueryResponse, {}, { data: TUsersData, history: History }>(UsersQuery, {
      props: (props) => ({
        data: props.data!,
        history: props.ownProps.history
      })
    })(
      graphql<{ history: History, data: TUsersData }, IDeleteUserResponse, IDeleteUserVariables, { history: History, data: TUsersData, deleteUser: TDeleteUserFunc }> (DeleteUserMutation, {
        props: (props) => ({
          data: props.ownProps.data,
          deleteUser: props.mutate!,
          history: props.ownProps.history
        })
      })(
        UserList
      )
    )
  )
);
