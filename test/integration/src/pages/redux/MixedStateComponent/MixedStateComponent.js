import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import register from 'soya/lib/client/Register';

class Component extends React.Component {
  render() {
    return <div>
    </div>;
  }
}

/**
 * Test use-cases where a DataComponent's state is not only determined from
 * queries, but also by either its own internal state or communication with
 * other Component/DataComponent.
 *
 * For example: input for flight search form return flight date, min/max date
 * is determined from departure flight, holidays are determined from data
 * queries.
 */
class MixedStateComponent extends Page {
  static get pageName() {
    return 'MixedStateComponent';
  }

  render(httpRequest, routeArgs, callback) {

  }
}

register(MixedStateComponent);
export default MixedStateComponent;