import React from 'react';
import connect from 'soya/lib/data/redux/connect';
import Form from 'soya/lib/data/redux/form/Form';
import FormSegment from 'soya/lib/data/redux/form/FormSegment';
import TodoSegment from '../segments/TodoSegment';
import TodoTextInput from '../soya-components/TodoTextInput'
import ContentResource from '../soya-components/ContentResource';

class SoyaHeader extends React.Component {
  static displayName = 'SoyaHeader';

  static connectId() {
    return SoyaHeader.displayName;
  }

  static getSegmentDependencies() {
    return [FormSegment, TodoSegment];
  }

  handleSave = text => {
    if (text.length !== 0) {
      this.todoActions.addTodo(text);
    }
  };

  componentWillMount() {
    const store = this.props.context.store;
    const todoActions = store.register(TodoSegment);
    this._form = new Form(store, SoyaHeader.displayName);
    this.todoActions = Object.keys(todoActions).reduce((actions, actionName) => {
      actions[actionName] = (...args) => store.dispatch(todoActions[actionName](...args));
      return actions;
    }, {});
  }

  render() {
    return (
      <header className="header">
        <h1><ContentResource crName='Header' entryKey='titleTodos' /></h1>
        <ContentResource
          component={TodoTextInput}
          renderProp='placeholder'
          crName='Header'
          name='todo'
          entryKey='placeholderTodoTextInput'
          newTodo
          form={this._form}
          onSave={this.handleSave}
        />
      </header>
    );
  }
}

export default connect(SoyaHeader);
