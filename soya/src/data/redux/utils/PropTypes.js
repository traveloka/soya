import PropTypes from 'prop-types';

export const contextShape = PropTypes.shape({
  config: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  cookieJar: PropTypes.object.isRequired,
  emitter: PropTypes.object.isRequired,
});
