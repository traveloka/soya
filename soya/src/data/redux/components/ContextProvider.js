import React from 'react';
import PropTypes from 'prop-types';
import { contextShape } from '../utils/PropTypes';

class ContextProvider extends React.Component {
  static childContextTypes = {
    context: contextShape.isRequired,
  };

  getChildContext() {
    return {
      context: this.props.context,
    };
  }

  static propTypes = {
    children: PropTypes.element.isRequired,
    context: contextShape.isRequired,
  };

  render() {
    return React.Children.only(this.props.children);
  }
}

export default ContextProvider;
