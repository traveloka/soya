import React from 'react';
import ReduxPage from 'soya/lib/page/ReduxPage';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import RenderResult from 'soya/lib/page/RenderResult';
import ContextProvider from 'soya/lib/data/redux/components/ContextProvider';
import register from 'soya/lib/client/Register';
import Header from '../soya-components/Header';
import MainSection from '../soya-components/MainSection';
import Link from '../soya-components/Link';
import 'todomvc-app-css/index.css';
import '../styles/todo.css'

const locale = {
  ID: {
    language: 'id',
    country: 'id',
  },
  EN: {
    language: 'en',
    country: 'id',
  },
  EN_SG: {
    language: 'en',
    country: 'sg',
  },
};

class TodoApp extends React.Component {
  render() {
    return (
      <div>
        <Link id='TODO_APP' param={{ locale: locale.ID }}>Indonesia (Bahasa)</Link><br />
        <Link id='TODO_APP' param={{ locale: locale.EN }}>Indonesia (Inggris)</Link><br />
        <Link id='TODO_APP' param={{ locale: locale.EN_SG }}>Singapore (Inggris)</Link><br />
        <div className='todoapp'>
          <Header />
          <MainSection />
        </div>
      </div>
    );
  }
}

class TodoPage extends ReduxPage {
  static get pageName() {
    return 'TodoPage';
  }

  static getRouteRequirements() {
    return [
      'TODO_APP',
    ];
  }

  render(req, { locale }, store, cb) {
    const renderer = new ReactRenderer();
    renderer.head = '<title>Todo App</title>';
    renderer.body = (
      <ContextProvider context={this.createContext(store, { locale })}>
        <TodoApp />
      </ContextProvider>
    );
    cb(new RenderResult(renderer));
  }
}

register(TodoPage);
export default TodoPage;
