import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters';
import ContentResource from '../soya-components/ContentResource';

const FILTER_TITLES = {
  [SHOW_ALL]: <ContentResource crName='Footer' entryKey='filterAll' />,
  [SHOW_ACTIVE]: <ContentResource crName='Footer' entryKey='filterActive' />,
  [SHOW_COMPLETED]: <ContentResource crName='Footer' entryKey='filterCompleted' />,
};

export default class Footer extends Component {
  static propTypes = {
    completedCount: PropTypes.number.isRequired,
    activeCount: PropTypes.number.isRequired,
    filter: PropTypes.string.isRequired,
    onClearCompleted: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired,
  }

  renderTodoCount() {
    const { activeCount } = this.props;
    return (
      <ContentResource
        className='todo-count'
        crName='Footer'
        entryKey='todoCount'
        param={{ activeCount }}
        renderProp='dangerouslySetInnerHTML'
      />
    );
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter];
    const { filter: selectedFilter, onShow } = this.props;

    return (
      <a
        className={classnames({ selected: filter === selectedFilter })}
        style={{ cursor: 'pointer' }}
        onClick={() => onShow(filter)}
      >
        {title}
      </a>
    );
  }

  renderClearButton() {
    const { completedCount, onClearCompleted } = this.props;
    if (completedCount > 0) {
      return (
        <button className='clear-completed' onClick={onClearCompleted}>
          <ContentResource crName='Footer' entryKey='buttonTextClearCompleted' />
        </button>
      );
    }
  }

  render() {
    return (
      <footer className='footer'>
        {this.renderTodoCount()}
        <ul className='filters'>
          {[SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(filter =>
            <li key={filter}>
              {this.renderFilterLink(filter)}
            </li>
          )}
        </ul>
        {this.renderClearButton()}
      </footer>
    );
  }
}
