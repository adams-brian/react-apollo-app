import { shallow } from 'enzyme';
import * as React from 'react';

import App from './App';
import About from './common/about';
import Counters from './counters/counters';
import Users from './users/users';

describe("App", () => {

  it('renders as expected', () => {
    const component = shallow(<App />);
    expect(component).toMatchSnapshot();
  });

  it('routes /counters to Counters', () => {
    const component = shallow(<App />);
    expect(component.find('Route[path="/counters"]').first().prop('component')).toBe(Counters);
  });

  it('routes /users to Users', () => {
    const component = shallow(<App />);
    expect(component.find('Route[path="/users"]').first().prop('component')).toBe(Users);
  });

  it('routes /about to About', () => {
    const component = shallow(<App />);
    expect(component.find('Route[path="/about"]').first().prop('component')).toBe(About);
  });

});
