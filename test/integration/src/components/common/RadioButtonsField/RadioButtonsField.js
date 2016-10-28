import React from 'react';
import createField from 'soya/lib/data/redux/form/createField';

import style from './style.mod.css';

export class RadioButtonsInput extends React.Component {
  render() {
    var i, value, id, radios = [], name;
    for (i = 0; i < this.props.options.length; i++) {
      value = this.props.options[i].value;
      id = 'RDB_' + this.props.form.getFormId() + this.props.name + '_' + i;
      name = 'RDB_' + this.props.form.getFormId() + this.props.name;
      radios.push(
        <div key={id}>
          <input id={id} type="radio" value={value}
                 checked={this.props.value == value} name={name}
                 disabled={this.props.isDisabled}
                 onChange={(event) => {this.props.handleChange(event.target.value)}} />
          <label htmlFor={id}>{this.props.options[i].label}</label>
        </div>
      );
    }

    return <div className={style.radioButton}>
      <label>{this.props.label}</label>
      {radios}
      {this.props.errorMessages.length > 0 ? <span>{this.props.errorMessages[0]}</span> : null}
    </div>;
  }
}

export default createField(RadioButtonsInput);