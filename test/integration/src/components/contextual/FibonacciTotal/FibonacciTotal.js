import React from 'react';

import FibonacciTotalSegment from '../../../segments/FibonacciTotalSegment.js';
import connect from 'soya/lib/data/redux/connect';
import { SERVER } from 'soya/lib/data/RenderType';

import style from './style.mod.css';

class FibonacciTotal {
  static connectId() {
    return 'FibonacciTotal';
  }

  static getSegmentDependencies() {
    return [FibonacciTotalSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydrationOption = null;
    if (nextProps.loadAtClient) {
      hydrationOption = {
        SERVER: false
      };
    }

    var query = { number: nextProps.number };
    subscribe(FibonacciTotalSegment.id(), query, 'fib', hydrationOption);
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