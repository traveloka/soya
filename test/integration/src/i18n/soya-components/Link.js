import React from 'react';
import connect from 'soya/lib/data/redux/connect';

class Link extends React.Component {
  static propTypes = {
    children: React.PropTypes.node,
    context: React.PropTypes.shape({
      locale: React.PropTypes.shape({
        country: React.PropTypes.string,
        language: React.PropTypes.string,
        locale: React.PropTypes.string,
      }).isRequired,
      router: React.PropTypes.object.isRequired,
    }).isRequired,
    hash: React.PropTypes.string,
    id: React.PropTypes.string,
    param: React.PropTypes.object,
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
