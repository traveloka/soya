import React from 'react';

import UserSegment from '../../../segments/UserSegment.js';
import connect from 'soya/lib/data/redux/connect';
import Hydration from 'soya/lib/data/redux/Hydration';

class UserProfile extends React.Component {
  static connectId() {
    return 'UserProfile';
  }

  static getSegmentDependencies() {
    return [UserSegment];
  }

  static subscribeQueries(props, subscribe) {
    var hydration = null;
    if (props.loadAtClient) {
      hydration = Hydration.noopAtServer();
    }

    subscribe(UserSegment.id(), { username: props.username }, 'user',
      hydration);
  }

  render() {
    if (this.props.result.user == null) {
      return <div>
        User data is loading....
      </div>
    }

    return <div>
      <ul>
        <li>User name: {this.props.result.user.data.username}</li>
        <li>First name: {this.props.result.user.data.firstName}</li>
        <li>Last name: {this.props.result.user.data.lastName}</li>
        <li>Email: {this.props.result.user.data.email}</li>
        <li>Posts: {this.props.result.user.data.posts}</li>
        <li>Badge: {this.props.result.user.data.badge}</li>
      </ul>
    </div>
  }
}

export default connect(UserProfile);