import React from 'react';

import FibonacciTotalSegment from '../../../segments/FibonacciTotalSegment.js';
import connect from 'soya/lib/data/redux/connect';
import Hydration from 'soya/lib/data/redux/Hydration';

import style from './style.mod.css';

class FibonacciTotal extends React.Component {
  static connectId() {
    return 'FibonacciTotal';
  }

  static getSegmentDependencies() {
    return [FibonacciTotalSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydration = null;
    if (nextProps.loadAtClient) {
      hydration = Hydration.noopAtServer();
    }

    var query = { number: nextProps.number };
    subscribe(FibonacciTotalSegment.id(), query, 'fib', hydration);
  }

  render() {
    var title = `Fibonacci Total (${this.props.number})`;
    if (this.props.result.fib == null) {
      return <div className={style.container}>
        <h3>{title}</h3>
        <p>Loading...</p>
      </div>
    }
    return <div className={style.container}>
      <h3>{title}</h3>
      <p>{this.props.result.fib.data}</p>
    </div>
  }
}

export default connect(FibonacciTotal);