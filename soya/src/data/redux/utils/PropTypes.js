import React from 'react';

export const contextShape = React.PropTypes.shape({
  config: React.PropTypes.object.isRequired,
  store: React.PropTypes.object.isRequired,
  router: React.PropTypes.object.isRequired,
  cookieJar: React.PropTypes.object.isRequired,
  emitter: React.PropTypes.object.isRequired,
});
