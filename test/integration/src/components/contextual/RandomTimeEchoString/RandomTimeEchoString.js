import React from 'react';

import ConcatRandomTimeEchoSegment from '../../../segments/ConcatRandomTimeEchoSegment.js';
import connect from 'soya/lib/data/redux/connect';
import { SERVER } from 'soya/lib/data/RenderType';

import style from './style.mod.css';

class RandomTimeEchoString {
  static connectId() {
    return 'RandomTimeEchoString';
  }

  static getSegmentDependencies() {
    return [ConcatRandomTimeEchoSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydrationOption = null;
    if (nextProps.loadAtClient) {
      hydrationOption = {
        SERVER: false
      };
    }

    var query = {
      value: nextProps.value,
      isParallel: nextProps.isParallel,
      shouldReplace: nextProps.shouldReplace,
      isReplaceParallel: nextProps.isReplaceParallel
    };

    subscribe(ConcatRandomTimeEchoSegment.id(), query, 'concatVal',
      hydrationOption);
  }

  render() {
    var title = 'String: \'' + this.props.value + '\'';
    title += this.props.isParallel ? ', Parallel' : ', Serial' ;

    if (this.props.result.concatVal == null) {
      return <div className={style.container}>
        <h3>{title}</h3>
        <p>Loading...</p>
      </div>
    }

    return <div className={style.container}>
      <h3>{title}</h3>
      <p>Result: {this.props.result.concatVal.data}</p>
    </div>
  }
}

export default connect(RandomTimeEchoString);