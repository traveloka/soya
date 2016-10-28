import React from 'react';

import FibonacciSegment from '../../../segments/FibonacciSegment.js';
import connect from 'soya/lib/data/redux/connect';
import { SERVER } from 'soya/lib/data/RenderType';

import style from './style.mod.css';

class FibonacciSequence {
  static connectId() {
    return 'FibonacciSequence';
  }

  static getSegmentDependencies() {
    return [FibonacciSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydrationOption = null;
    if (nextProps.loadAtClient) {
      hydrationOption = {
        SERVER: false
      };
    }

    var query = {
      number: nextProps.number
    };

    subscribe(FibonacciSegment.id(), query, 'fib', hydrationOption);
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