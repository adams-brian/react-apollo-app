import * as React from 'react';

interface IState {
  timeoutFired: boolean;
}

export default class Loading extends React.Component<{}, IState> {
  private timeout: NodeJS.Timer;

  constructor(props: {}) {
      super(props);
      this.state = {
          timeoutFired: false
      };
  }

  public componentDidMount() {
    this.timeout = setTimeout(() => this.setState({timeoutFired: true}), 500);
  }

  public componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  public render() {
    return this.state.timeoutFired ? <div>Loading...</div> : null;
  }
}
