import { History } from 'history';
import * as React from 'react';
import { graphql } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Link, withRouter } from 'react-router-dom';
import { branch, mapProps, renderComponent } from 'recompose';

import Loading from '../common/loading';
import { CREATE_USER_TEMP_ID, CreateUserMutation, ICreateUserResponse,
  ICreateUserVariables, IUpdateUserResponse, IUser,
  IUserQueryResponse, IUsersQueryResponse,
  IUserVariables, TCreateUserFunc, TUpdateUserFunc,
  UpdateUserMutation, UserQuery, UsersQuery } from './queries';

interface IProps {
  createUser: TCreateUserFunc;
  history: History;
  updateUser: TUpdateUserFunc;
  user: IUser;
}

export class EditUser extends React.Component<IProps, IUser> {
  constructor(props: IProps) {
    super(props);
    this.state = {...props.user};
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
        variables: { ...this.state }
      });
    }
    else {
      this.props.createUser({
        optimisticResponse: {
          createUser: { ...this.state, id: CREATE_USER_TEMP_ID, __typename: 'User' }
        },
        update: (store, data) => {
          if (data.data) {
            const user = data.data.createUser;
            const users = store.readQuery<IUsersQueryResponse>({ query: UsersQuery });
            const list = users && users.users ? users.users : [];
            store.writeQuery({
              data: { users: [...list, {...user}] },
              query: UsersQuery
            });
          }
        },
        variables: { firstname: this.state.firstname, lastname: this.state.lastname } });
    }
    this.props.history.push('/users');
  }
}

export const generateComponent = () =>
  withRouter(
    mapProps(
      (props: RouteComponentProps<{id: string}>) => ({ history: props.history, id: props.match.params.id })
    )(
      graphql<{ history: History, id: string }, IUserQueryResponse, IUserVariables, { history: History, id: string, loading?: boolean, user?: IUser }>(UserQuery, {
        options: (props) => ({
          variables: {
            id: props.id
          }
        }),
        props: (props) => ({
          history: props.ownProps.history,
          id: props.ownProps.id,
          loading: props.data === undefined || props.data.loading === true,
          user: props.data !== undefined && props.data.user !== undefined ? props.data.user : { id: '', firstname: '', lastname: '' }
        }),
        skip: (props) => !(props.id && props.id.length > 0)
      })(
        branch((props: { history: History, id: string, loading?: boolean, user?: IUser }) => props.loading !== undefined && props.loading === true,
          renderComponent(Loading)
        )(
          mapProps(
            (props: { history: History, id: string, loading?: boolean, user?: IUser }) => ({
              history: props.history,
              user: props.user !== undefined ? props.user : { id: '', firstname: '', lastname: '' }
            })
          )(
            graphql<{ history: History, user: IUser }, ICreateUserResponse, ICreateUserVariables, { createUser: TCreateUserFunc, history: History, user: IUser }> (CreateUserMutation, {
              props: (props) => ({
                createUser: props.mutate!,
                history: props.ownProps.history,
                user: props.ownProps.user
              })
            })(
              graphql<{ createUser: TCreateUserFunc, history: History, user: IUser }, IUpdateUserResponse, IUser, IProps> (UpdateUserMutation, {
                props: (props) => ({
                  createUser: props.ownProps.createUser,
                  history: props.ownProps.history,
                  updateUser: props.mutate!,
                  user: props.ownProps.user
                })
              })(
                EditUser
              )
            )
          )
        )
      )
    )
  )

export default generateComponent();
