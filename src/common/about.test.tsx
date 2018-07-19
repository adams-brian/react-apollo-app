import { shallow } from 'enzyme';
import * as React from 'react';

import About from './about';

describe("About", () => {
  
  it('renders as expected', () => {
    const component = shallow(<About />);
    expect(component).toMatchSnapshot();
  });

});
