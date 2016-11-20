import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';

export default class BookingService extends Service {
  static id() {
    return 'bookings';
  }
  
  static success(payload) {
    return {
      success: true,
      payload: payload
    };
  }
  
  static failure(errorMessage) {
    return {
      success: false,
      errorMessage: errorMessage
    }
  }

  fetchBooking(bookingId, lifetimeToken, sessionToken) {
    // Note: Pretend we send the tokens to back-end for verification.
    return new Promise((resolve, reject) => {
      request.get(`http://${this.config.apiHost}/api/booking/` + encodeURIComponent(bookingId)).end((err, res) => {
        var payload = JSON.parse(res.text);
        if (res.ok) {
          resolve(BookingService.success(payload));
        } else if (res.notFound) {
          resolve(BookingService.failure(payload.error));
        } else {
          reject(new Error('Unable to fetch booking data!'));
        }
      });
    });
  }
}