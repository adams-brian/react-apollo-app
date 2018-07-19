import { shallow } from 'enzyme';
import * as React from 'react';
import * as sinon from 'sinon';

import Counter from './counter';

const counter = 123;
const index = 456;

describe("Counter", () => {

  let increment: sinon.SinonSpy;
  let decrement: sinon.SinonSpy;
  let reset: sinon.SinonSpy;
  let remove: sinon.SinonSpy;
  let element: JSX.Element;

  beforeEach(() => {
    increment = sinon.fake();
    decrement = sinon.fake();
    reset = sinon.fake();
    remove = sinon.fake();
    element = (
      <Counter
        counter={counter}
        index={index}
        increment={increment}
        decrement={decrement}
        reset={reset}
        remove={remove}
      />
    );
  });

  it('renders as expected', () => {
    const component = shallow(element);
    expect(component).toMatchSnapshot();
  });

  it('calls remove prop function with index', () => {
    const component = shallow(element);
    expect(remove.called).toBe(false);
    component.find('button').at(0).simulate('click');
    expect(remove.calledOnceWithExactly(index)).toBe(true);
  });

  it('calls increment prop function with index', () => {
    const component = shallow(element);
    expect(increment.called).toBe(false);
    component.find('button').at(1).simulate('click');
    expect(increment.calledOnceWithExactly(index)).toBe(true);
  });

  it('calls decrement prop function with index', () => {
    const component = shallow(element);
    expect(decrement.called).toBe(false);
    component.find('button').at(2).simulate('click');
    expect(decrement.calledOnceWithExactly(index)).toBe(true);
  });

  it('calls reset prop function with index', () => {
    const component = shallow(element);
    expect(reset.called).toBe(false);
    component.find('button').at(3).simulate('click');
    expect(reset.calledOnceWithExactly(index)).toBe(true);
  });
  
});
