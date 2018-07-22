import * as React from 'react';
import { graphql } from 'react-apollo';
import { branch, mapProps, renderComponent } from 'recompose';

import Loading from '../common/loading';
import Counter from './counter';
import { CountersQuery, ICountersQueryResponse, ISaveCountersResponse, ISaveCountersVariables,
  SaveCountersMutation, TSaveCountersFunc } from './queries';

interface IProps {
  counters: number[];
  saveCounters: TSaveCountersFunc;
}

class Counters extends React.Component<IProps, {}> {

  public render() {
    return (
      <div className="counters-container">
        <h1>Counters</h1>
        <div className="counter-container">
          {this.props.counters.map((counter, index) =>
            (<Counter
              key={index} /* not ideal, but it works in this case */
              index={index}
              counter={counter}
              increment={this.increment}
              decrement={this.decrement}
              reset={this.reset}
              remove={this.remove}
            />))}
          <div className="add-counter rounded" onClick={this.addCounter}>
            <span className="fa fa-plus" />
          </div>
        </div>
      </div>
    );
  }

  private save = (counters: number[]) => {
    this.props.saveCounters({
      optimisticResponse: {
        saveCounters: counters
      },
      update: (store, data) => {
        const saveCounters = data && data.data && data.data.saveCounters ? data.data!.saveCounters : [];
        store.writeQuery({ query: CountersQuery, data: { counters: saveCounters } });
      },
      variables: { counters }
    });
  }
  private increment = (index: number) => {
    this.save( this.props.counters.map((c, i) => i === index ? c + 1 : c) );
  }
  private decrement = (index: number) => {
    this.save( this.props.counters.map((c, i) => i === index ? c - 1 : c) );
  }
  private reset = (index: number) => {
    this.save( this.props.counters.map((c, i) => i === index ? 0 : c) );
  }
  private remove = (index: number) => {
    this.save( [...this.props.counters.slice(0, index), ...this.props.counters.slice(index+1)] );
  }
  private addCounter = () => {
    this.save( [...this.props.counters, 0] );
  }
}

export default
graphql<{}, ICountersQueryResponse, {}, { counters: number[], loading: boolean }>(CountersQuery, {
  props: (props) => ({
    counters: props.data !== undefined && props.data.counters !== undefined ? props.data.counters : [],
    loading: props.data === undefined || props.data.loading
  })
})(
  branch((props: { counters: number[], loading: boolean }) => props.loading,
    renderComponent(Loading)
  )(
    mapProps((props: { counters: number[], loading: boolean }) => ({
      counters: props.counters
    }))(
      graphql<{ counters: number[] }, ISaveCountersResponse, ISaveCountersVariables, IProps> (SaveCountersMutation, {
        props: (props) => ({
          counters: props.ownProps.counters,
          saveCounters: props.mutate!
        })
      })(
        Counters
      )
    )
  )
);
