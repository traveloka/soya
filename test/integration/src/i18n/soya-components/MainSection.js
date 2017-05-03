import React from 'react';
import connect from 'soya/lib/data/redux/connect';
import MainSection from '../components/MainSection';
import TodoSegment from '../segments/TodoSegment';

class SoyaMainSection extends React.Component {
  static displayName = 'SoyaMainSection';

  static connectId() {
    return SoyaMainSection.displayName;
  }

  static getSegmentDependencies() {
    return [TodoSegment];
  }

  static subscribeQueries(props, subscribe) {
    subscribe(TodoSegment.id(), '*', 'todos');
  }

  componentWillMount() {
    const store = this.props.context.store;
    const todoActions = store.register(TodoSegment);
    this.todoActions = Object.keys(todoActions).reduce((actions, actionName) => {
      actions[actionName] = (...args) => store.dispatch(todoActions[actionName](...args));
      return actions;
    }, {});
  }

  render() {
    return (
      <MainSection actions={this.todoActions} todos={this.props.result.todos || []} />
    );
  }
}

export default connect(SoyaMainSection);
