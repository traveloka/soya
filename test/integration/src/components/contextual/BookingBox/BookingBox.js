import React from 'react';

import BookingSegment from '../../../segments/BookingSegment.js';
import connect from 'soya/lib/data/redux/connect';
import Hydration from 'soya/lib/data/redux/Hydration';

import style from './style.mod.css';

class BookingBox extends React.Component {
  static connectId() {
    return 'BookingBox';
  }

  static getSegmentDependencies() {
    return [BookingSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydration = null;
    if (nextProps.loadAtClient) {
      hydration = Hydration.noopAtServer();
    }

    var query = {
      bookingId: nextProps.bookingId
    };

    subscribe(BookingSegment.id(), query, 'booking', hydration);
  }

  render() {
    var title = `Booking Detail (${this.props.bookingId})`;
    if (this.props.result.booking == null) {
      return <div className={style.container}>
        <h3>{title}</h3>
        <p>Loading...</p>
      </div>
    }

    if (this.props.result.booking.errors) {
      return <div className={style.container}>
        <h3>{title}</h3>
        <p>Error: {this.props.result.booking.errors[0]}</p>
      </div>;
    }

    return <div className={style.container}>
      <h3>{title}</h3>
      <ul>
        <li>Type: {this.props.result.booking.data.type}</li>
        <li>Status: {this.props.result.booking.data.status}</li>
        <li>Last Updated: {new Date(this.props.result.booking.data.timestamp).toGMTString()}</li>
      </ul>
    </div>;
  }
}

export default connect(BookingBox);