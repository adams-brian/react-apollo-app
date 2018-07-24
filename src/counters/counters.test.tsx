import { shallow } from 'enzyme';
import * as React from 'react';
import * as reactApollo from 'react-apollo';
import * as recompose from 'recompose';
import * as sinon from 'sinon';

import Loading from '../common/loading';
import { Counters, generateComponent } from './counters';
import { CountersQuery, SaveCountersMutation } from './queries';

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

  describe('connection', () => {

    let graphql: sinon.SinonStub;
    let branch: sinon.SinonStub;
    let mapProps: sinon.SinonStub;
    let renderComponent: sinon.SinonStub;

    const replaceGqlNames = (arg: any) => {
      if (arg === CountersQuery) {
        return 'CountersQuery';
      }
      if (arg === SaveCountersMutation) {
        return 'SaveCountersMutation';
      }
      return arg;
    }
    const tracker = (name: string) =>
      (...setupArgs: any[]) =>
        (...callArgs: any[]) => ({
          callArgs: callArgs.map(a => replaceGqlNames(a)),
          name,
          setupArgs: setupArgs.map(a => replaceGqlNames(a)),
        })

    beforeEach(() => {
      graphql = sinon.stub(reactApollo, 'graphql').callsFake( tracker('graphql') );
      branch = sinon.stub(recompose, 'branch').callsFake( tracker('branch') );
      mapProps = sinon.stub(recompose, 'mapProps').callsFake( tracker('mapProps') );
      renderComponent = sinon.stub(recompose, 'renderComponent').callsFake(
        (...args) =>
          args.length === 1 && args[0] === Loading? 'renderComponent(Loading)' : 'renderComponent(UNKNOWN)'
      );
    });

    afterEach(() => {
      graphql.restore();
      branch.restore();
      mapProps.restore();
      renderComponent.restore();
    });

    it('connects as expected', () => {
      const composition = generateComponent() as any;
      expect(composition).toMatchSnapshot();

      let current = composition;

      expect(current.name).toBe('graphql');
      expect(current.setupArgs.length).toBe(2);
      expect(current.setupArgs[0]).toBe('CountersQuery');
      let opts = current.setupArgs[1];
      expect(opts.props({})).toEqual({
        counters: [],
        loading: true
      });
      expect(opts.props({
        data: { counters: [3,1,2] }
      })).toEqual({
        counters: [3,1,2],
        loading: false
      });
      expect(opts.props({
        data: { loading: true }
      })).toEqual({
        counters: [],
        loading: true
      });
      expect(opts.props({
        data: { counters: [3,1,2], loading: true }
      })).toEqual({
        counters: [3,1,2],
        loading: true
      });
      expect(opts.props({
        data: { counters: [3,1,2], loading: false }
      })).toEqual({
        counters: [3,1,2],
        loading: false
      });
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('branch');
      expect(current.setupArgs.length).toBe(2);
      const test = current.setupArgs[0];
      expect(test({ counters: [3,1,2], loading: false })).toBe(false);
      expect(test({ counters: [3,1,2], loading: true })).toBe(true);
      expect(branch.firstCall.args[1]).toBe('renderComponent(Loading)');
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('mapProps');
      expect(current.setupArgs.length).toBe(1);
      const mapper = current.setupArgs[0];
      expect(mapper({ counters: [3,1,2], loading: true })).toEqual({
        counters: [3,1,2]
      });
      expect(mapper({ counters: [1], loading: false })).toEqual({
        counters: [1]
      });
      expect(current.callArgs.length).toBe(1);

      current = current.callArgs[0];
      expect(current.name).toBe('graphql');
      expect(current.setupArgs.length).toBe(2);
      expect(current.setupArgs[0]).toBe('SaveCountersMutation');
      opts = current.setupArgs[1];
      expect(opts.props({
        mutate: 'saveCounters',
        ownProps: {
          counters: [3,1,2]
        }
      })).toEqual({
        counters: [3,1,2],
        saveCounters: 'saveCounters'
      });
      expect(current.callArgs.length).toBe(1);
      expect(current.callArgs[0]).toBe(Counters);
    });

  });

});
