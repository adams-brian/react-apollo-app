import * as React from 'react';

interface ICounterProps {
  counter: number;
  index: number;
  increment: (index: number) => void;
  decrement: (index: number) => void;
  reset: (index: number) => void;
  remove: (index: number) => void;
}

export default class Counter extends React.Component<ICounterProps> {
  
  public render() { 
    return (
      <div className="counter">
        <button type="button" className="close" aria-label="Close" onClick={this.remove}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div><h1>{this.props.counter}</h1></div>
        <div>
          <button onClick={this.increment}><span className="fa fa-plus"/></button>
          <button onClick={this.decrement}><span className="fa fa-minus"/></button>
          <button onClick={this.reset}><span className="fa fa-refresh"/></button>
        </div>
      </div>
    );
  }
  private increment = () =>
    this.props.increment(this.props.index);
  private decrement = () =>
    this.props.decrement(this.props.index);
  private reset = () =>
    this.props.reset(this.props.index);
  private remove = () =>
    this.props.remove(this.props.index);
}
