import { History } from 'history';
import * as React from 'react';
import { graphql } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Link, withRouter } from 'react-router-dom';
import { mapProps } from 'recompose';
import { branch, renderComponent } from 'recompose';

import Loading from '../common/loading';
import { CreateUserMutation, ICreateUserResponse, ICreateUserVariables,
  IUpdateUserResponse, IUser, IUserQueryResponse, IUsersQueryResponse,
  IUserVariables, TCreateUserFunc, TUpdateUserFunc, TUserData,
  UpdateUserMutation, UserQuery, UsersQuery } from './queries';

interface IProps {
  history: History;
  data: TUserData;
  createUser: TCreateUserFunc;
  updateUser: TUpdateUserFunc;
}

export class EditUser extends React.Component<IProps, IUser> {
  constructor(props: IProps) {
    super(props);
    this.state = props.data.user || { id: '', firstname: '', lastname: ''};
  }

  public render() {
    return (
      <div className="edit-user">
        <h1>{this.state.id && this.state.id.length > 0 ? 'Edit' : 'Create'} User</h1>
        <form>
          <div className="form-group">
            <label htmlFor="firstname">Firstname</label>
            <input
              placeholder="Firstname"
              type="text"
              className="form-control"
              name="firstname"
              id="firstname"
              value={this.state.firstname}
              onChange={this.inputChanged}
              required={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Lastname</label>
            <input
              placeholder="Lastname"
              type="text"
              className="form-control"
              name="lastname"
              id="lastname"
              value={this.state.lastname}
              onChange={this.inputChanged}
              required={true}
            />
          </div>
          <div>
            <Link to="/users">
              <button type="button" className="btn btn-secondary">Cancel</button>
            </Link>
            {' '}
            <button 
              className="btn btn-primary" 
              type="submit" 
              onClick={this.submit} 
              disabled={this.state.firstname.length === 0 || this.state.lastname.length === 0}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    );
  }

  private inputChanged = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      [e.currentTarget.name]: e.currentTarget.value
    } as Pick<IUser, keyof IUser>);
  }

  private submit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (this.state.id && this.state.id.length > 0) {
      this.props.updateUser({
        optimisticResponse: {
          updateUser: { ...this.state, __typename: 'User' }
        },
        update: (store, data) => {
          if (data.data) {
            const user = data.data.updateUser;
            store.writeQuery({
              data: { user },
              query: UserQuery,
              variables: { id: user.id }
            });
          }
        },
        variables: { ...this.state }
      });
    }
    else {
      this.props.createUser({
        update: (store, data) => {
          if (data.data) {
            const user = data.data.createUser;
            store.writeQuery({
              data: { user },
              query: UserQuery,
              variables: { id: user.id }
            });
            const users = store.readQuery<IUsersQueryResponse>({ query: UsersQuery });
            const list = users && users.users ? users.users : [];
            store.writeQuery({
              data: { users: [...list, user] },
              query: UsersQuery
            });
          }
        },
        variables: { firstname: this.state.firstname, lastname: this.state.lastname } });
    }
    this.props.history.push('/users');
  }
}

export default
withRouter(
  mapProps(
    (props: RouteComponentProps<{id: string}>) => ({ id: props.match.params.id, history: props.history })
  )(
    graphql<{ id: string, history: History }, IUserQueryResponse, IUserVariables, { id: string, data: TUserData, history: History }>(UserQuery, {
      options: (props) => ({
        variables: {
          id: props.id
        }
      }),
      props: (props) => ({
        data: props.data! as TUserData, // needs "as" until https://github.com/apollographql/react-apollo/pull/2094 is released
        history: props.ownProps.history,
        id: props.ownProps.id
      })
    })(
      mapProps(
        (props: { id: string, data: TUserData, history: History }) => ({ data: props.data, history: props.history })
      )(
        graphql<{ data: TUserData, history: History }, ICreateUserResponse, ICreateUserVariables, {history: History, data: TUserData, createUser: TCreateUserFunc }> (CreateUserMutation, {
          props: (props) => ({
            createUser: props.mutate!,
            data: props.ownProps.data,
            history: props.ownProps.history
          })
        })(
          graphql<{ history: History, data: TUserData, createUser: TCreateUserFunc }, IUpdateUserResponse, IUser, {history: History, data: TUserData, createUser: TCreateUserFunc, updateUser: TUpdateUserFunc }> (UpdateUserMutation, {
            props: (props) => ({
              createUser: props.ownProps.createUser,
              data: props.ownProps.data,
              history: props.ownProps.history,
              updateUser: props.mutate!
            })
          })(
            branch((props: IProps) => props.data.loading,
              renderComponent(Loading)
            )(
              EditUser
            )
          )
        )
      )
    )
  )
);
