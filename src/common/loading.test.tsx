import { mount } from 'enzyme';
import * as React from 'react';
import * as sinon from 'sinon';

import Loading from './loading';

describe("Loading", () => {

  let clock: sinon.SinonFakeTimers;
  const element = <Loading />;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('should render null for 500ms, then loading', () => {
    const component = mount(element);
    expect(component.html()).toMatchSnapshot();
    clock.tick(500);
    expect(component.html()).toMatchSnapshot();
    clock.tick(5000);
    expect(component.html()).toMatchSnapshot();
  });

  it('should clear the timeout on unmount', () => {
    const component = mount(element);
    expect(component.html()).toMatchSnapshot();
    component.unmount();
    clock.tick(5000);
    expect(component.html()).toMatchSnapshot();
  });

});
