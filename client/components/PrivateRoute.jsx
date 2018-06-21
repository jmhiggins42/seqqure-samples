import React from 'react';
import { Route, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({
  component: Component,
  loginPending,
  loggedIn,
  roles,
  allowedRoles,
  ...rest
}) =>
  !loginPending && (
    <Route
      {...rest}
      render={props =>
        !loggedIn ? (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        ) : !allowedRoles || roles.some(role => allowedRoles.includes(role)) ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/' }} />
        )
      }
    />
  );

const mapStateToProps = state => {
  return {
    loginPending: state.loginStatus.loginPending,
    loggedIn: state.loginStatus.loggedIn,
    roles: state.loginStatus.user ? state.loginStatus.user.roles : []
  };
};

export default withRouter(connect(mapStateToProps)(PrivateRoute));
