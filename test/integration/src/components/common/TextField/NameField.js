import React from 'react';
import createField from 'soya/lib/data/redux/form/createField';

import { TextInput } from './TextField.js';
import { name } from '../../../validator/string.js';

export class NameInput extends React.Component {
  static connectId() {
    return 'NameField';
  }

  componentWillMount() {
    this.props.registerChangeValidators(name);
  }

  render() {
    return <TextInput {...this.props} />;
  }
}

export default createField(NameInput);