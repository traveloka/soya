import React from 'react';
import ReduxPage from 'soya/lib/page/ReduxPage';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import register from 'soya/lib/client/Register';

import FavoritesSegment from '../../../segments/FavoritesSegment.js';
import Favorites from '../../../components/contextual/Favorites/Favorites.js';

import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  componentWillMount() {
    var store = this.props.context.store;
    store.register(FavoritesSegment);
    store.dispatch(FavoritesSegment.getActionCreator().set({
      'Food': 'Rendang',
      'Drink': 'Water',
      'Exercise': '-'
    }));

    store.subscribe(FavoritesSegment.id(), '*', (favorites) => {
      if (favorites['Drink'] == 'Coca-Cola' && favorites['Exercise'] != 'Running') {
        store.dispatch(FavoritesSegment.getActionCreator().set({
          'Exercise': 'Running'
        }));
      }
    }, this);
  }

  render() {
    return <div>
      <h1>Recursive Handle Change</h1>
      <ul>
        <li>This tests behavior of <code>ReduxStore</code> when a subscriber callback dispatches another action that further changes the state, resulting in recursive call to the change handler.</li>
        <li>If when setting state to <code>A</code>, there's a subscriber callback that further changes the state to <code>B</code>, the views should be updated with <code>B</code>, not <code>A</code>.</li>
        <li><a href="javascript:void(0)" onClick={this.updateFavoriteDrink.bind(this)}>Clicking this link</a> will set favorite drink into <code>Coca-Cola</code>, however it will trigger a callback that will set exercise into <code>Running</code>.</li>
        <li>The view below should be updated only once, and it should be updated with both exercise and drink set to the correct value.</li>
        <li>Check the log, and make sure that handle change with a stale state is prevented.</li>
      </ul>
      <Favorites context={this.props.context} />
    </div>
  }

  updateFavoriteDrink() {
    this.props.context.store.dispatch(FavoritesSegment.getActionCreator().set({
      'Drink': 'Coca-Cola'
    }));
  }
}

class RecursiveHandleChange extends ReduxPage {
  static get pageName() {
    return 'RecursiveHandleChange';
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Recursive Handle Change Test</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store)
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(RecursiveHandleChange);
export default RecursiveHandleChange;