import {
  FETCH_CONTENT_RESOURCE,
} from '../constants/ContentResourceConstant';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CONTENT_RESOURCE:
      return Object.keys(action.data).reduce((prevState, name) => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          ...action.data[name],
        },
      }), state);

    default:
      return state;
  }
};
