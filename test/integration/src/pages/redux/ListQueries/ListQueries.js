import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import register from 'soya/lib/client/Register';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

class Component extends React.Component {
  render() {
    return <div>
      <DebugPanel top right bottom>
        <DevTools store={this.props.store} monitor={LogMonitor} />
      </DebugPanel>
    </div>;
  }
}

class ListQueries extends Page {
  static get pageName() {
    return 'ListQueries';
  }

  render(httpRequest, routeArgs, callback) {

  }
}

register(ListQueries, __filename);
export default ListQueries;