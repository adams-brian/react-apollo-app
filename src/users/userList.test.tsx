import { shallow } from 'enzyme';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import * as reactApollo from 'react-apollo';
import * as reactRouterDom from 'react-router-dom';
import * as recompose from 'recompose';
import * as sinon from 'sinon';

import Loading from '../common/loading';
import { CREATE_USER_TEMP_ID, DeleteUserMutation, UsersQuery } from './queries';
import { generateComponent, UserList } from './userList';

type propFunction = (id: string) => void;

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

describe("UserList", () => {
  
  describe("component", () => {

    let element: JSX.Element;
    let deleteUser: sinon.SinonSpy;
    let push: sinon.SinonSpy;
    
    beforeEach(() => {
      
      deleteUser = sinon.spy();
      const history = createMemoryHistory();
      push = sinon.spy(history, 'push');

      element = (
        <UserList
          users={users}
          deleteUser={deleteUser}
          history={history}
        />
      );
    });

    afterEach(() => {
      push.restore();
    })

    it('renders as expected', () => {
      const component = shallow(element);
      expect(component).toMatchSnapshot();
    });

    describe('deleteUser', () => {

      it('does nothing if called with CREATE_USER_TEMP_ID', () => {
        const component = shallow(element);
        expect(deleteUser.called).toBe(false);
        (component.find('UserListRow').at(0).prop('deleteUser') as propFunction)(CREATE_USER_TEMP_ID);
        expect(deleteUser.called).toBe(false);
      });

      it('calls deleteUser and updates UsersQuery', () => {
        const component = shallow(element);
        expect(deleteUser.called).toBe(false);
        (component.find('UserListRow').at(0).prop('deleteUser') as propFunction)('123');
        expect(deleteUser.calledOnce).toBe(true);
        expect(deleteUser.firstCall.args.length).toBe(1);
        const opts = deleteUser.firstCall.args[0];
        expect(opts).toMatchSnapshot();
        const readQuery = sinon.fake.returns({ users });
        const writeQuery = sinon.spy();
        opts.update({ readQuery, writeQuery }, { data: { deleteUser: { id: '123', __typename: 'User' }}});
        expect(readQuery.calledOnce).toBe(true);
        expect(readQuery.args[0]).toEqual([{ query: UsersQuery }]);
        expect(writeQuery.calledOnce).toBe(true);
        expect(writeQuery.args[0]).toEqual([{
          data: { users: users.slice(1) },
          query: UsersQuery
        }]);
      });

      it('updates UsersQuery when readQuery returns null', () => {
        const component = shallow(element);
        (component.find('UserListRow').at(0).prop('deleteUser') as propFunction)('123');
        const update = deleteUser.firstCall.args[0].update;
        const readQuery = sinon.fake.returns(null);
        const writeQuery = sinon.spy();
        update({ readQuery, writeQuery }, { data: { deleteUser: { id: '123', __typename: 'User' }}});
        expect(writeQuery.calledOnce).toBe(true);
        expect(writeQuery.args[0]).toEqual([{
          data: { users: [] },
          query: UsersQuery
        }]);
      });

      it('skips update if id is not passed', () => {
        const component = shallow(element);
        (component.find('UserListRow').at(0).prop('deleteUser') as propFunction)('123');
        const update = deleteUser.firstCall.args[0].update;
        const readQuery = sinon.spy();
        const writeQuery = sinon.spy();
        update({ readQuery, writeQuery }, null);
        update({ readQuery, writeQuery }, { data: null });
        update({ readQuery, writeQuery }, { data: { deleteUser: null } });
        update({ readQuery, writeQuery }, { data: { deleteUser: { not_id: '123', __typename: 'User' } } });
        expect(readQuery.called).toBe(false);
        expect(writeQuery.called).toBe(false);
      });

    });

    describe('editUser', () => {

      it('calls editUser', () => {
        const component = shallow(element);
        expect(push.called).toBe(false);
        (component.find('UserListRow').at(1).prop('editUser') as propFunction)('456');
        expect(push.calledOnceWithExactly('/users/456')).toBe(true);
      });

      it('does nothing if called with CREATE_USER_TEMP_ID', () => {
        const component = shallow(element);
        expect(push.called).toBe(false);
        (component.find('UserListRow').at(1).prop('editUser') as propFunction)(CREATE_USER_TEMP_ID);
        expect(push.called).toBe(false);
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
      if (arg === DeleteUserMutation) {
        return 'DeleteUserMutation';
      }
      if (arg === UsersQuery) {
        return 'UsersQuery';
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
        otherStuff: 'other stuff'
      })).toEqual({
        history: 'the history'
      });
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('graphql');
      expect(current.setupArgs.length).toBe(2);
      expect(current.setupArgs[0]).toBe('UsersQuery');
      let opts = current.setupArgs[1];
      expect(opts.props({
        ownProps: {
          history: 'the history'
        }
      })).toEqual({
        history: 'the history',
        loading: true,
        users: []
      });
      expect(opts.props({
        data: { },
        ownProps: {
          history: 'the history'
        }
      })).toEqual({
        history: 'the history',
        loading: false,
        users: []
      });
      expect(opts.props({
        data: {
          users: 'the users'
        },
        ownProps: {
          history: 'the history'
        }
      })).toEqual({
        history: 'the history',
        loading: false,
        users: 'the users'
      });
      expect(opts.props({
        data: {
          loading: true,
          users: 'the users'
        },
        ownProps: {
          history: 'the history'
        }
      })).toEqual({
        history: 'the history',
        loading: true,
        users: 'the users'
      });
      expect(opts.props({
        data: {
          loading: false,
          users: 'the users'
        },
        ownProps: {
          history: 'the history'
        }
      })).toEqual({
        history: 'the history',
        loading: false,
        users: 'the users'
      });
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
        loading: false,
        users: 'the users'
      })).toEqual({
        history: 'the history',
        users: 'the users'
      });
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('graphql');
      expect(current.setupArgs.length).toBe(2);
      expect(current.setupArgs[0]).toBe('DeleteUserMutation');
      opts = current.setupArgs[1];
      expect(opts.props({
        mutate: 'deleteUser',
        ownProps: {
          history: 'the history',
          users: 'the users'
        }
      })).toEqual({
        deleteUser: 'deleteUser',
        history: 'the history',
        users: 'the users'
      });
      expect(current.callArgs.length).toBe(1);
      expect(current.callArgs[0]).toBe(UserList);
    });

  });

});
