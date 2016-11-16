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

class SetHttpStatus extends Page {
  static get pageName() {
    return 'SetHttpStatus';
  }

  render(httpRequest, routeArgs, callback) {

  }
}

register(SetHttpStatus);
export default SetHttpStatus;