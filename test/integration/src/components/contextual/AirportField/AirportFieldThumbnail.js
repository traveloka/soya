import React from 'react';

import AirportField from './AirportField.js';
import Form from 'soya/lib/data/redux/form/Form';

export default class AirportFieldThumbnail extends React.Component {
  componentWillMount() {
    this._form = new Form(this.props.context.reduxStore, 'AirportFieldThumbnail');
  }

  render() {
    return <AirportField context={this.props.context} form={this._form}
                         label="Airport" name="airport" />;
  }
}