import React from 'react';

import BadgeSegment from '../../../segments/BadgeSegment.js';
import connect from 'soya/lib/data/redux/connect';
import { SERVER } from 'soya/lib/data/RenderType';

class BadgeList extends React.Component {
  static connectId() {
    return 'BadgeList';
  }

  static getSegmentDependencies(config) {
    return [BadgeSegment];
  }

  static subscribeQueries(props, subscribe) {
    subscribe(BadgeSegment.id(), null, 'badge');
  }

  render() {
    if (this.props.result.badge == null) {
      return <div>
        Badge list is loading....
      </div>
    }

    return <div>
      <ul>
        <li>Low Posts (&lt;= 5): {this.props.result.badge.data.low}</li>
        <li>Med Posts (&lt;= 10): {this.props.result.badge.data.medium}</li>
        <li>High Posts (&gt; 10): {this.props.result.badge.data.high}</li>
      </ul>
    </div>
  }
}

export default connect(BadgeList);