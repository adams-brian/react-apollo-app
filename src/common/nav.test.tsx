import { shallow } from 'enzyme';
import * as React from 'react';

import Nav from './nav';

describe("Nav", () => {

  it('renders as expected', () => {
    const component = shallow(<Nav />);
    expect(component).toMatchSnapshot();
  });
  
});
