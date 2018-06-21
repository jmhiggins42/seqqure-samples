import {
  LOADING_END,
  LOGIN_PENDING,
  LOGIN_SUCCESS,
  LOGIN_OPTIONS,
  LOGIN_ERROR,
  ON_LOGOUT
} from '../actions/loginActions';

const loginStatus = (
  state = {
    loading: true,
    loginPending: false,
    loggedIn: false,
    user: null,
    person: null,
    tenantOptions: [],
    errorMessage: null
  },
  action
) => {
  switch (action.type) {
    case LOADING_END:
      return Object.assign({}, state, { loading: false });

    case LOGIN_PENDING:
      return Object.assign({}, state, { loginPending: action.loginPending });

    case LOGIN_OPTIONS:
      return Object.assign({}, state, { tenantOptions: action.tenantOptions });

    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        loggedIn: action.loggedIn,
        user: action.user,
        person: action.person,
        tenantOptions: [],
        errorMessage: null
      });

    case LOGIN_ERROR:
      return Object.assign({}, state, { errorMessage: action.errorMessage });

    case ON_LOGOUT:
      return Object.assign({}, state, {
        loginPending: false,
        loggedIn: false,
        user: null,
        errorMessage: null
      });

    default:
      return state;
  }
};

export default loginStatus;
