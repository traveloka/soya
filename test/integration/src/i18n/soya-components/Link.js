import React from 'react';
import PropTypes from 'prop-types';
import connect from 'soya/lib/data/redux/connect';

class Link extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    context: PropTypes.shape({
      locale: PropTypes.shape({
        country: PropTypes.string,
        language: PropTypes.string,
        locale: PropTypes.string,
      }).isRequired,
      router: PropTypes.object.isRequired,
    }).isRequired,
    hash: PropTypes.string,
    id: PropTypes.string,
    param: PropTypes.object,
  };

  render() {
    const { locale, router } = this.props.context;
    return (
      <a href={router.reverseRoute(this.props.id, { locale, ...this.props.param }, this.props.hash)}>
        {this.props.children}
      </a>
    );
  }
}

export default connect(Link);
