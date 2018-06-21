import { getSession } from '../services/sessionService';
import { loginUser, logoutUser, checkEmail } from '../services/userService';

/* Login Actions */
export const LOADING_END = 'LOADING_END';
export const LOGIN_PENDING = 'LOGIN_PENDING';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_OPTIONS = 'LOGIN_OPTIONS';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const ON_LOGOUT = 'ON_LOGOUT';

/* Login Action Creators */
const loadingEnd = () => {
  return { type: LOADING_END };
};

const loginPending = loginPending => {
  return { type: LOGIN_PENDING, loginPending };
};

const loginError = errorMessage => {
  return { type: LOGIN_ERROR, errorMessage };
};

const onLogout = () => {
  return { type: ON_LOGOUT };
};

const loginSuccess = json => {
  return {
    type: LOGIN_SUCCESS,
    loggedIn: json ? true : false,
    user: json.user,
    person: json.person
  };
};

const loginOptions = tenants => {
  return { type: LOGIN_OPTIONS, tenantOptions: tenants };
};

export const getInfo = fromOnLoad => dispatch => {
  getSession()
    .then(
      data => {
        if (fromOnLoad) dispatch(loadingEnd());
        dispatch(loginPending(false));
        return data.item;
      },
      err => {
        if (fromOnLoad) dispatch(loadingEnd());
        dispatch(loginPending(false));

        if (err.response) {
          dispatch(loginError(err.response.data.errors));
        } else {
          dispatch(loginError('Getting user info error:', err.message));
        }

        return null;
      }
    )
    .then(json => {
      if (json) {
        const user = {
          _id: json._id,
          email: json.email,
          enabled: json.enabled,
          roles: json.roles
        };
        const person = { ...json.person };
        dispatch(loginSuccess({ user, person }));
      }
    });
};

export const onLoad = () => dispatch => {
  dispatch(loginPending(true));
  dispatch(getInfo(true));
};

export const login = user => dispatch => {
  loginUser(user).then(
    data => {
      dispatch(getInfo());
    },
    err => {
      dispatch(loginPending(false));
      if (err.response && err.response.status === 401) {
        dispatch(loginError('Incorrect login details'));
      } else {
        dispatch(loginError('Login error:', err.message));
      }
    }
  );
};

export const initialLogin = userWithoutTenant => dispatch => {
  const { email, password } = userWithoutTenant;

  dispatch(loginError(null));
  dispatch(loginPending(true));

  checkEmail({ email }).then(
    data => {
      const tenants = data.items;
      if (tenants.length === 1) {
        const user = { email, password, tenantId: tenants[0]._id };
        dispatch(login(user));
        return;
      }
      dispatch(loginPending(false));
      dispatch(loginOptions(tenants));
    },
    err => {
      dispatch(loginPending(false));
      if (err.response) {
        dispatch(loginError(err.response.data.errors));
      } else {
        dispatch(loginError('Login error:', err.message));
      }
    }
  );
};

export const fullLogin = user => dispatch => {
  dispatch(loginError(null));
  dispatch(loginPending(true));
  dispatch(login(user));
};

export const logout = () => dispatch => {
  dispatch(onLogout());
  logoutUser().then(null, err => dispatch(loginError('Logout error: ', err)));
};
