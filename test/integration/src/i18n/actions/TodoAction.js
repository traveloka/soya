import Load from 'soya/lib/data/redux/Load';
import * as constants from '../constants/TodoConstant'

export const addTodo = text => ({ type: constants.ADD_TODO, text })
export const deleteTodo = id => ({ type: constants.DELETE_TODO, id })
export const editTodo = (id, text) => ({ type: constants.EDIT_TODO, id, text })
export const completeTodo = id => ({ type: constants.COMPLETE_TODO, id })
export const completeAll = () => ({ type: constants.COMPLETE_ALL })
export const clearCompleted = () => ({ type: constants.CLEAR_COMPLETED })

const fetchTodos = todos => ({ type: constants.FETCH_TODOS, todos })

export const load = () => {
  const load = new Load(constants.TODO_SEGMENT);
  load.func = (dispatch, queryFunc, services) => {
    const service = services[constants.TODO_SERVICE];
    return service.fetchTodos()
      .then(data => {
        dispatch(fetchTodos(data));
      });
  };
  return load;
};
