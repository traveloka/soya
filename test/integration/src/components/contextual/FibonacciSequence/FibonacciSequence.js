import React from 'react';

import FibonacciSegment from '../../../segments/FibonacciSegment.js';
import connect from 'soya/lib/data/redux/connect';
import Hydration from 'soya/lib/data/redux/Hydration';

import style from './style.mod.css';

class FibonacciSequence extends React.Component {
  static connectId() {
    return 'FibonacciSequence';
  }

  static getSegmentDependencies() {
    return [FibonacciSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydration = null;
    if (nextProps.loadAtClient) {
      hydration = Hydration.noopAtServer();
    }

    var query = {
      number: nextProps.number
    };

    subscribe(FibonacciSegment.id(), query, 'fib', hydration);
  }

  render() {
    var title = `Fibonacci Sequence (${this.props.number})`;
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

export default connect(FibonacciSequence);