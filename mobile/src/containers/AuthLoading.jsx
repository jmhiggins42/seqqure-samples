import React from 'react';
import { connect } from 'react-redux';

// Components
import Loading from '../components/Loading';

/* Redux Actions & other local import here */

class AuthLoading extends React.Component {
  componentWillMount = () => this.props.onLoad();

  componentWillReceiveProps = newProps => {
    const { loading, loginPending, loggedIn } = newProps.loginStatus;

    // navigate if done loading
    !loading && !loginPending && newProps.navigation.navigate(loggedIn ? 'App' : 'Auth');
  };

  render = () => <Loading />;
}

const mapStateToProps = state => {
  return { loginStatus: state.loginStatus };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoad: () => dispatch(onLoad())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthLoading);
