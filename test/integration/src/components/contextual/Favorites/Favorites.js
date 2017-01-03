import React from 'react';
import connect from 'soya/lib/data/redux/connect';
import FavoritesSegment from '../../../segments/FavoritesSegment.js';

class Favorites extends React.Component {
  static getSegmentDependencies() {
    return [FavoritesSegment];
  }

  static subscribeQueries(props, subscribe) {
    subscribe(FavoritesSegment.id(), '*', 'fav');
  }

  render() {
    if (this.props.result.fav == null) return null;
    var key, list = [];
    for (key in this.props.result.fav) {
      list.push(<li key={key}>{key}: {this.props.result.fav[key]}</li>);
    }
    return <div>
      <h3>List of Favorites:</h3>
      <ul>
        {list}
      </ul>
    </div>;
  }
}

export default connect(Favorites);