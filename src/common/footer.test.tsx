import { shallow } from 'enzyme';
import * as React from 'react';

import Footer from './footer';

describe("Footer", () => {

  it('renders as expected', () => {
    const component = shallow(<Footer />);
    expect(component).toMatchSnapshot();
  });
  
});
