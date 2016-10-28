import React from 'react';

import BookingSegment from '../../../segments/BookingSegment.js';
import connect from 'soya/lib/data/redux/connect';
import { SERVER } from 'soya/lib/data/RenderType';

import style from './style.mod.css';

class BookingBox {
  static connectId() {
    return 'BookingBox';
  }

  static getSegmentDependencies() {
    return [BookingSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    var hydrationOption = null;
    if (nextProps.loadAtClient) {
      hydrationOption = {
        SERVER: false
      };
    }

    var query = {
      bookingId: nextProps.bookingId
    };

    subscribe(BookingSegment.id(), query, 'booking', hydrationOption);
  }

  render() {
    var title = `Booking Detail (${this.props.bookingId})`;
    if (this.props.result.booking == null || !this.props.result.booking.loaded) {
      var loading = <p>Loading...</p>;
      if (this.props.result.booking != null) {
        if (this.props.result.booking.errors) {
          loading = <p>Error: {this.props.result.booking.errors[0]}</p>;
        }
      }
      return <div className={style.container}>
        <h3>{title}</h3>
        {loading}
      </div>
    }

    return <div className={style.container}>
      <h3>{title}</h3>
      <ul>
        <li>Type: {this.props.result.booking.data.type}</li>
        <li>Status: {this.props.result.booking.data.status}</li>
        <li>Last Updated: {new Date(this.props.result.booking.data.timestamp).toGMTString()}</li>
      </ul>
    </div>
  }
}

export default connect(BookingBox);