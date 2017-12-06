import React from 'react';
import PropTypes from 'prop-types';

export default class Autocomplete extends React.Component {
  static get propTypes() {
    return {
      data: PropTypes.array.isRequired,
      children: PropTypes.node,
    };
  }

  render() {
    const preppedChildren = React.Children.map(
      this.props.children, child => {
        return React.cloneElement(child, {
          search: this.search.bind(this),
        });
      }
    );
    return (
      <div>
        {preppedChildren}
      </div>
    );
  }

  search(val) {
    const regex = new RegExp(`${val}`, 'i');
    return this.props.data.filter(item => {
      return regex.test(item.searchStr);
    });
  }
}
