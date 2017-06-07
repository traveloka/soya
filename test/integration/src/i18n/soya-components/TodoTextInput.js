import React from 'react';
import createField from 'soya/lib/data/redux/form/createField';
import TodoTextInput from '../components/TodoTextInput';

class FieldTodoTextInput extends React.Component {
  componentWillMount() {
    this.props.registerChangeValidators([
      (value) => {
        if (value === null || value === '') {
          return 'Empty';
        }
        return false;
      },
      (value) => {
        if (value === null || value === '') {
          return {
            crName: 'Validator',
            entryKey: 'empty',
          };
        }
        return false;
      },
    ]);
  }

  render() {
    return <TodoTextInput {...this.props} />;
  }
}

export default createField(FieldTodoTextInput);
