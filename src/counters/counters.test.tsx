import { shallow } from 'enzyme';
import * as React from 'react';
import * as sinon from 'sinon';

import { Counters } from './counters';
import { CountersQuery } from './queries';

type propFunction = (index: number) => void;

describe("Counters", () => {

  const counters = [5,1,4,3,2];

  describe("component", () => {

    let element: JSX.Element;
    let saveCounters: sinon.SinonSpy;

    beforeEach(() => {
      saveCounters = sinon.spy();

      element = <Counters
        counters={[...counters]}
        saveCounters={saveCounters}
      />
    });

    it('renders as expected', () => {
      const component = shallow(element);
      expect(component).toMatchSnapshot();
    });

    const checkSaveCounters = (updatedCounters: number[]) => {
      expect(saveCounters.calledOnce).toBe(true);
      expect(saveCounters.firstCall.args.length).toBe(1);
      const config = saveCounters.firstCall.args[0];
      expect(config.optimisticResponse).toEqual({
        saveCounters: updatedCounters
      });
      expect(config.variables).toEqual({ counters: updatedCounters });
      const writeQuery = sinon.spy();
      config.update( { writeQuery }, null);
      config.update( { writeQuery }, { data: null });
      config.update( { writeQuery }, { data: { saveCounters: null }});
      config.update( { writeQuery }, { data: { saveCounters: updatedCounters }});
      expect(writeQuery.calledOnceWithExactly({
        data: {
          counters: updatedCounters
        },
        query: CountersQuery
      })).toBe(true);
    }

    it('calls saveCounters on addCounter', () => {
      const component = shallow(element);
      expect(saveCounters.called).toBe(false);
      component.find('.add-counter').simulate('click');
      checkSaveCounters([...counters, 0]);
    });
  
    it('calls saveCounters on increment', () => {
      const component = shallow(element);
      expect(saveCounters.called).toBe(false);
      const index = 1;
      (component.find('Counter').at(index).prop('increment') as propFunction)(index);
      checkSaveCounters(counters.map((c, i) => i === index ? c + 1 : c));
    });

    it('calls saveCounters on decrement', () => {
      const component = shallow(element);
      expect(saveCounters.called).toBe(false);
      const index = 2;
      (component.find('Counter').at(index).prop('decrement') as propFunction)(index);
      checkSaveCounters(counters.map((c, i) => i === index ? c - 1 : c));
    });

    it('calls saveCounters on reset', () => {
      const component = shallow(element);
      expect(saveCounters.called).toBe(false);
      const index = 3;
      (component.find('Counter').at(index).prop('reset') as propFunction)(index);
      checkSaveCounters(counters.map((c, i) => i === index ? 0 : c));
    });

    it('calls saveCounters on remove', () => {
      const component = shallow(element);
      expect(saveCounters.called).toBe(false);
      const index = 4;
      (component.find('Counter').at(index).prop('remove') as propFunction)(index);
      checkSaveCounters([...counters.slice(0, index), ...counters.slice(index+1)]);
    });

  });

});
