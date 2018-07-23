import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as sinon from 'sinon';

import { IUser } from './queries';
import UserListRow from './userListRow';

describe("UserListRow", () => {

  let user: IUser;
  let editUser: sinon.SinonSpy;
  let deleteUser: sinon.SinonSpy;
  let element: JSX.Element;
  
  beforeEach(() => {
    user = {
      firstname: 'abc',
      id: '123',
      lastname: 'def'
    }
  
    editUser = sinon.fake();
    deleteUser = sinon.fake();
    element = (
      <UserListRow 
        user={user}
        editUser={editUser}
        deleteUser={deleteUser}
      />
    );
  });

  it('renders as expected', () => {
    const component = shallow(element);
    expect(component).toMatchSnapshot();
  });

  it('calls editUser prop function with the user id', () => {
    const component = shallow(element);
    expect(editUser.called).toBe(false);
    component.find('tr').first().simulate('click');
    expect(editUser.calledOnceWithExactly('123')).toBe(true);
  });

  it('calls deleteUser prop function with the user id', () => {
    const component = mount(
      <table>
        <tbody>
          {element}
        </tbody>
      </table>
    );
    expect(deleteUser.called).toBe(false);
    component.find('button').first().simulate('click');
    // make sure the event didn't propogate
    expect(editUser.called).toBe(false);
    expect(deleteUser.calledOnceWithExactly('123')).toBe(true);
  });
  
});
