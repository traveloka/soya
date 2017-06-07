import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import ContentResource from '../soya-components/ContentResource';

export default class TodoTextInput extends Component {
  static propTypes = {
    onSave: PropTypes.func.isRequired,
    text: PropTypes.string,
    placeholder: PropTypes.string,
    editing: PropTypes.bool,
    newTodo: PropTypes.bool
  }

  state = {
    text: this.props.text || ''
  }

  handleSubmit = e => {
    const text = e.target.value.trim()
    if (e.which === 13) {
      this.props.onSave(text)
      if (this.props.newTodo) {
        this.setState({ text: '' })
      }
    }
  }

  handleChange = e => {
    const text = e.target.value;
    this.setState({ text }, () => {
      if (this.props.handleChange) {
        this.props.handleChange(text);
      }
    })
  }

  handleBlur = e => {
    if (!this.props.newTodo) {
      this.props.onSave(e.target.value)
    }
  }

  render() {
    const errorMessages = this.props.errorMessages;
    const hasErrors = errorMessages.length > 0;

    return (
      <div>
        <input className={
          classnames({
            edit: this.props.editing,
            'new-todo': this.props.newTodo,
            error: hasErrors,
          })}
          type="text"
          placeholder={this.props.placeholder}
          autoFocus="true"
          value={this.state.text}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleSubmit}
        />
        {hasErrors && (
          <ul className='error'>
            <li>{errorMessages[0]}</li>
            <ContentResource
              component='li'
              {...errorMessages[1]}
            />
          </ul>
        )}
      </div>
    )
  }
}
