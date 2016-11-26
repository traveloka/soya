import React from 'react';
import createField from 'soya/lib/data/redux/form/createField';

import style from './style.mod.css';

export class SelectBoxInput extends React.Component {
  static connectId() {
    return 'SelectBoxField';
  }

  componentWillMount() {
    // First option always automatically picked in a select box.
    this.props.setDefaultValue(this.props.options[0].value);
  }

  componentWillReceiveProps(nextProps) {
    // First option always automatically picked in a select box.
    if (nextProps.value == null || nextProps.value == '') {
      this.props.handleChange(this.props.options[0].value);
    }
  }

  render() {
    var i, value, options = [];
    for (i = 0; i < this.props.options.length; i++) {
      value = this.props.options[i].value;
      options.push(<option key={value} value={value}>{this.props.options[i].label}</option>);
    }

    return <div className={style.selectBox}>
      <label>{this.props.label}</label>
      <select value={this.props.value} disabled={this.props.isDisabled}
              onChange={(event) => this.props.handleChange(event.target.value, event)}>
        {options}
      </select>
      {this.props.errorMessages.length > 0 ? <span>{this.props.errorMessages[0]}</span> : null}
    </div>;
  }
}

export default createField(SelectBoxInput);