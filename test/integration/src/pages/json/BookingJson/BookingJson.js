import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

var bookingJson = {
  29000: {
    bookingId: 29000,
    timestamp: new Date().getTime(),
    type: 'FLIGHT',
    status: 'ISSUED'
  },
  29001: {
    bookingId: 29001,
    timestamp: new Date().getTime(),
    type: 'HOTEL',
    status: 'UNPAID'
  }
};

var notFound = {
  error: 'Booking ID doesn\'t exist.'
};

class BookingJson extends Page {
  static get pageName() {
    return 'BookingJson';
  }

  render(httpRequest, routeArgs, store, callback) {
    var id = routeArgs.id;
    var jsonRenderer, renderResult;
    if (bookingJson.hasOwnProperty(id)) {
      jsonRenderer = new JsonRenderer(bookingJson[id]);
      renderResult = new RenderResult(jsonRenderer);
    } else {
      jsonRenderer = new JsonRenderer(notFound);
      renderResult = new RenderResult(jsonRenderer);
      renderResult.setStatusCode(404);
    }

    // Simulate network delay of 3 seconds.
    setTimeout(callback.bind({}, renderResult), 1000);
  }
}

register(BookingJson, __filename);
export default BookingJson;