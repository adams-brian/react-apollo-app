import { shallow } from 'enzyme';
import { createMemoryHistory, MemoryHistory } from 'history'
import * as React from 'react';
import * as reactApollo from 'react-apollo';
import * as reactRouterDom from 'react-router-dom';
import * as recompose from 'recompose';
import * as sinon from 'sinon';

import Loading from '../common/loading';
import { EditUser, generateComponent } from './editUser';
import { CreateUserMutation, UpdateUserMutation, UserQuery, UsersQuery } from './queries';

const users = [
  {
    firstname: 'abc',
    id: '123',
    lastname: 'def'
  },
  {
    firstname: 'hij',
    id: '456',
    lastname: 'klm'
  }
];

describe("EditUser", () => {

  describe('component', () => {

    let element: JSX.Element;
    let history: MemoryHistory;
    let push: sinon.SinonSpy;
    let createUser: sinon.SinonSpy;
    let updateUser: sinon.SinonSpy;

    beforeEach(() => {
      history = createMemoryHistory();
      push = sinon.spy(history, 'push');
      createUser = sinon.spy();
      updateUser = sinon.spy();
    });

    afterEach(() => {
      push.restore();
    });

    describe("create user mode", () => {

      beforeEach(() => {
        element = <EditUser
          createUser={createUser}
          history={history}
          updateUser={updateUser}
          user={{
            firstname: '',
            id: '',
            lastname: ''
          }}
        />;
      });

      it('renders as expected', () => {
        const component = shallow(element);
        expect(component).toMatchSnapshot();
      });

      it('calls createUser on submit', () => {
        const component = shallow(element);
        expect(createUser.called).toBe(false);
        expect(push.called).toBe(false);
        const preventDefault = sinon.spy();
        const user = {
          firstname: 'new',
          id: 'newid',
          lastname: 'user'
        };
        component.find('#firstname').first().simulate('change', { currentTarget: { name: 'firstname', value: user.firstname } });
        component.find('#lastname').first().simulate('change', { currentTarget: { name: 'lastname', value: user.lastname } });
        component.find('button[type="submit"]').first().simulate('click', { preventDefault });
        expect(preventDefault.called).toBe(true);
        expect(createUser.calledOnce).toBe(true);
        expect(createUser.firstCall.args.length).toBe(1);
        const config = createUser.firstCall.args[0];
        expect(config).toMatchSnapshot();
        let readQuery = sinon.fake.returns({ users });
        const writeQuery = sinon.spy();
        config.update({ readQuery, writeQuery }, { data: { createUser: {...user, __typename: 'User'}}});
        expect(readQuery.calledOnceWithExactly({ query: UsersQuery })).toBe(true);
        expect(writeQuery.calledOnceWithExactly({
          data: { users: [...users, {...user, __typename: 'User'}]},
          query: UsersQuery
        })).toBe(true);
        readQuery = sinon.fake.returns({ });
        writeQuery.resetHistory();
        config.update({ readQuery, writeQuery }, {});
        config.update({ readQuery, writeQuery }, { data: { createUser: {...user, __typename: 'User'}}});
        expect(readQuery.calledOnceWithExactly({ query: UsersQuery })).toBe(true);
        expect(writeQuery.calledOnceWithExactly({
          data: { users: [{...user, __typename: 'User'}]},
          query: UsersQuery
        })).toBe(true);
        expect(push.calledOnceWithExactly('/users')).toBe(true);
      });

    });

    describe("edit user mode", () => {

      beforeEach(() => {
        element = <EditUser
          createUser={createUser}
          history={history}
          updateUser={updateUser}
          user={{
            firstname: 'abc',
            id: '123',
            lastname: 'def'
          }}
        />;
      });

      it('renders as expected', () => {
        const component = shallow(element);
        expect(component).toMatchSnapshot();
      });

      it('calls updateUser', () => {
        const component = shallow(element);
        expect(updateUser.called).toBe(false);
        expect(push.called).toBe(false);
        const preventDefault = sinon.spy();
        const user = {
          firstname: 'updated',
          id: '123',
          lastname: 'user'
        };
        component.find('#firstname').first().simulate('change', { currentTarget: { name: 'firstname', value: user.firstname } });
        component.find('#lastname').first().simulate('change', { currentTarget: { name: 'lastname', value: user.lastname } });
        component.find('button[type="submit"]').first().simulate('click', { preventDefault });
        expect(preventDefault.called).toBe(true);
        expect(updateUser.calledOnceWithExactly({
          optimisticResponse: {
            updateUser: {...user, __typename: 'User'}
          },
          variables: user
        })).toBe(true);
        expect(push.calledOnceWithExactly('/users')).toBe(true);
      });

    });

  });

  describe('connection', () => {

    let withRouter: sinon.SinonStub;
    let graphql: sinon.SinonStub;
    let branch: sinon.SinonStub;
    let mapProps: sinon.SinonStub;
    let renderComponent: sinon.SinonStub;

    const replaceGqlNames = (arg: any) => {
      if (arg === CreateUserMutation) {
        return 'CreateUserMutation';
      }
      if (arg === UpdateUserMutation) {
        return 'UpdateUserMutation';
      }
      if (arg === UserQuery) {
        return 'UserQuery';
      }
      return arg;
    }
    const tracker = (name: string) =>
      (...setupArgs: any[]) =>
        (...callArgs: any[]) => ({
          callArgs: callArgs.map(a => replaceGqlNames(a)),
          name,
          setupArgs: setupArgs.map(a => replaceGqlNames(a)),
        })

    beforeEach(() => {
      withRouter = sinon.stub(reactRouterDom, 'withRouter').callsFake( tracker('withRouter')() );
      graphql = sinon.stub(reactApollo, 'graphql').callsFake( tracker('graphql') );
      branch = sinon.stub(recompose, 'branch').callsFake( tracker('branch') );
      mapProps = sinon.stub(recompose, 'mapProps').callsFake( tracker('mapProps') );
      renderComponent = sinon.stub(recompose, 'renderComponent').callsFake(
        (...args) =>
          args.length === 1 && args[0] === Loading? 'renderComponent(Loading)' : 'renderComponent(UNKNOWN)'
      );
    });

    afterEach(() => {
      withRouter.restore();
      graphql.restore();
      branch.restore();
      mapProps.restore();
      renderComponent.restore();
    });

    it('connects as expected', () => {
      const composition = generateComponent() as any;
      expect(composition).toMatchSnapshot();

      let current = composition;

      expect(current.name).toBe('withRouter');
      expect(current.setupArgs).toEqual([]);
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('mapProps');
      expect(current.setupArgs.length).toBe(1);
      let mapper = current.setupArgs[0];
      expect(mapper({
        history: 'the history',
        match: { params: { id: 'the id' } }
      })).toEqual({
        history: 'the history',
        id: 'the id'
      });
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('graphql');
      expect(current.setupArgs.length).toBe(2);
      expect(current.setupArgs[0]).toBe('UserQuery');
      let opts = current.setupArgs[1];
      expect(opts.options({ id: 'the id' })).toEqual({
        variables: { id: 'the id' }
      });
      expect(opts.props({
        ownProps: {
          history: 'the history',
          id: 'the id'
        }
      })).toEqual({
        history: 'the history',
        id: 'the id',
        loading: true,
        user: { id: '', firstname: '', lastname: '' }
      });
      expect(opts.props({
        data: { },
        ownProps: {
          history: 'the history',
          id: 'the id'
        }
      })).toEqual({
        history: 'the history',
        id: 'the id',
        loading: false,
        user: { id: '', firstname: '', lastname: '' }
      });
      expect(opts.props({
        data: {
          user: 'the user'
        },
        ownProps: {
          history: 'the history',
          id: 'the id'
        }
      })).toEqual({
        history: 'the history',
        id: 'the id',
        loading: false,
        user: 'the user'
      });
      expect(opts.props({
        data: {
          loading: true,
          user: 'the user'
        },
        ownProps: {
          history: 'the history',
          id: 'the id'
        }
      })).toEqual({
        history: 'the history',
        id: 'the id',
        loading: true,
        user: 'the user'
      });
      expect(opts.props({
        data: {
          loading: false,
          user: 'the user'
        },
        ownProps: {
          history: 'the history',
          id: 'the id'
        }
      })).toEqual({
        history: 'the history',
        id: 'the id',
        loading: false,
        user: 'the user'
      });
      expect(opts.skip({})).toBe(true);
      expect(opts.skip({ id: null })).toBe(true);
      expect(opts.skip({ id: '' })).toBe(true);
      expect(opts.skip({ id: 'the id' })).toBe(false);
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('branch');
      expect(current.setupArgs.length).toBe(2);
      const test = current.setupArgs[0];
      expect(test({ })).toBe(false);
      expect(test({ otherStuff: 'anything' })).toBe(false);
      expect(test({ otherStuff: 'anything', loading: false })).toBe(false);
      expect(test({ otherStuff: 'anything', loading: true })).toBe(true);
      expect(current.setupArgs[1]).toBe('renderComponent(Loading)');
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('mapProps');
      expect(current.setupArgs.length).toBe(1);
      mapper = current.setupArgs[0];
      expect(mapper({
        history: 'the history',
        id: 'the id',
      })).toEqual({
        history: 'the history',
        user: { id: '', firstname: '', lastname: '' }
      });
      expect(mapper({
        history: 'the history',
        id: 'the id',
        loading: true,
        user: 'the user'
      })).toEqual({
        history: 'the history',
        user: 'the user'
      });
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('graphql');
      expect(current.setupArgs.length).toBe(2);
      expect(current.setupArgs[0]).toBe('CreateUserMutation');
      opts = current.setupArgs[1];
      expect(opts.props({
        mutate: 'createUser',
        ownProps: {
          history: 'the history',
          user: 'the user'
        }
      })).toEqual({
        createUser: 'createUser',
        history: 'the history',
        user: 'the user'
      });
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('graphql');
      expect(current.setupArgs.length).toBe(2);
      expect(current.setupArgs[0]).toBe('UpdateUserMutation');
      opts = current.setupArgs[1];
      expect(opts.props({
        mutate: 'updateUser',
        ownProps: {
          createUser: 'createUser',
          history: 'the history',
          user: 'the user'
        }
      })).toEqual({
        createUser: 'createUser',
        history: 'the history',
        updateUser: 'updateUser',
        user: 'the user'
      });
      expect(current.callArgs.length).toBe(1);
      expect(current.callArgs[0]).toBe(EditUser);

    });

  });

});
