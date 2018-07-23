import { shallow } from 'enzyme';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import * as sinon from 'sinon';

import { CREATE_USER_TEMP_ID, UsersQuery } from './queries';
import { UserList } from './userList';

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

});
