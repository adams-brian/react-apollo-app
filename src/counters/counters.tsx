import * as React from 'react';
import { ChildDataProps, compose, graphql, MutateProps } from 'react-apollo';

import Counter from './counter';
import { CountersQuery, ICountersQueryResponse, ISaveCountersVariables, SaveCountersMutation } from './queries';

class Counters extends React.Component<ChildDataProps<{}, ICountersQueryResponse> & MutateProps<{}, ISaveCountersVariables>, {}> {

  public render() {
    if (this.props.data.loading) {
      return <div>Loading...</div>;
    }
    return (
      <div className="counters-container">
        <h1>Counters</h1>
        <h3>Count: {this.counters.length}</h3>
        <div className="counter-container">
          {this.counters.map((counter, index) =>
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

  private get counters() {
    return this.props.data.counters || [];
  }

  private save = (counters: number[]) => {
    this.props.mutate({
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
    this.save( this.counters.map((c, i) => i === index ? c + 1 : c) );
  }
  private decrement = (index: number) => {
    this.save( this.counters.map((c, i) => i === index ? c - 1 : c) );
  }
  private reset = (index: number) => {
    this.save( this.counters.map((c, i) => i === index ? 0 : c) );
  }
  private remove = (index: number) => {
    this.save( [...this.counters.slice(0, index), ...this.counters.slice(index+1)] );
  }
  private addCounter = () => {
    this.save( [...this.counters, 0] );
  }
}

export default compose(
  graphql<{}, ICountersQueryResponse>(CountersQuery),
  graphql<{}, ICountersQueryResponse, ISaveCountersVariables>(SaveCountersMutation)
)(Counters)
