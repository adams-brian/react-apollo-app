import { shallow } from 'enzyme';
import { createMemoryHistory, MemoryHistory } from 'history'
import * as React from 'react';
import * as sinon from 'sinon';

import { EditUser } from './editUser';
import { UsersQuery } from './queries';

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
      const readQuery = sinon.fake.returns({ users });
      const writeQuery = sinon.spy();
      config.update({ readQuery, writeQuery }, { data: { createUser: {...user, __typename: 'User'}}});
      expect(readQuery.calledOnceWithExactly({ query: UsersQuery })).toBe(true);
      expect(writeQuery.calledOnceWithExactly({
        data: { users: [...users, {...user, __typename: 'User'}]},
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
