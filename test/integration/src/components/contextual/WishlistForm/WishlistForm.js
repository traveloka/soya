import React from 'react';

import './style.css';

import TextField from '../../common/TextField/TextField';
import RepeatableGames from './RepeatableGames';
import RepeatableAdd from '../../common/RepeatableAdd/RepeatableAdd';
import { required, minSelected, requiredCheckbox, optional } from '../../../validator/general.js';

export default class WishlistForm extends React.Component {
  render() {
    return <div className={'form'}>
      <h3>{this.props.formName}</h3>
      <h4>Goals</h4>
      <TextField form={this.props.form} name={['goals', 'professional']} label="Professional"
                 changeValidators={[required]} context={this.props.context} />
      <div>
        <h5>Material</h5>
        <TextField form={this.props.form} name={['goals', 'material', 'lodging']} label="Lodging"
                   changeValidators={[required]} context={this.props.context} />
        <TextField form={this.props.form} name={['goals', 'material', 'electronics']} label="Electronics"
                   changeValidators={[required]} context={this.props.context} />
        <TextField form={this.props.form} name={['goals', 'material', 'furniture']} label="Furniture"
                   changeValidators={[required]} context={this.props.context} />
      </div>
      <div>
        <h5>Personality</h5>
        <TextField form={this.props.form} name={['goals', 'personality', 'anger']} label="Anger"
                   changeValidators={[required]} context={this.props.context} />
        <TextField form={this.props.form} name={['goals', 'personality', 'patience']} label="Patience"
                   changeValidators={[required]} context={this.props.context} />
      </div>
      <h4>Places Visited</h4>
      <div>
        <h5>SEA</h5>
        <TextField form={this.props.form} name={['visited', 0, 0]} label="Indonesia"
                   context={this.props.context} />
        <TextField form={this.props.form} name={['visited', 0, 1]} label="Malaysia"
                   context={this.props.context} />
        <h5>Europe</h5>
        <TextField form={this.props.form} name={['visited', 1, 0]} label="Germany"
                   context={this.props.context} />
      </div>
      <h4>Games</h4>
      <RepeatableGames form={this.props.form} name={'games'} minLength={1}
                       context={this.props.context} />
      <RepeatableAdd form={this.props.form} context={this.props.context}
                     name={'games'} minLength={1} label={'Tambah Game'} />
      <button onClick={this.handleSubmit.bind(this)}>Submit</button>
    </div>;
  }

  submit(result) {
    console.log('VALIDATION RESULT', result);
    this.props.form.unlockSubmission();
  }

  formWideValidate(data) {
    console.log('FORM-WIDE-VALIDATE', data);
  }

  handleSubmit() {
    this.props.form.lockSubmission();
    this.props.form.submit(
      this.submit.bind(this),
      this.formWideValidate.bind(this)
    );
  }
}