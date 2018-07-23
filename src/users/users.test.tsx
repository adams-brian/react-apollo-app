import { shallow } from 'enzyme';
import * as React from 'react';

import EditUser from './editUser';
import UserList from './userList';
import Users from './users';

describe("Users", () => {

  describe('component', () => {

    let element: JSX.Element;

    beforeEach(() => {
      element = <Users />
    });

    it('renders as expected', () => {
      const component = shallow(element);
      expect(component).toMatchSnapshot();
    });

    it('routes /users to UserList', () => {
      const component = shallow(element);
      expect(component.find('Route[exact=true][path="/users"]').first().prop('component')).toBe(UserList);
    });

    it('routes /users/createuser to EditUser', () => {
      const component = shallow(element);
      expect(component.find('Route[exact=true][path="/users/createuser"]').first().prop('component')).toBe(EditUser);
    });

    it('routes /users/:id to EditUser', () => {
      const component = shallow(element);
      expect(component.find('Route[path="/users/:id"]').first().prop('component')).toBe(EditUser);
    });

  });

});
