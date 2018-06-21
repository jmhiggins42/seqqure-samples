import React from 'react';
import { Platform, StyleSheet, ToastAndroid, ScrollView } from 'react-native';

// Redux
import { connect } from 'react-redux';
import { initialLogin, fullLogin } from '../../actions/loginActions';

// Components
import Header from '../../components/Header';
import LoginForm from './LoginForm';
import LoginTenantForm from './LoginTenantForm';

class LoginScreen extends React.Component {
  static defaultForm = {
    email: '',
    tenantId: '',
    password: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      formData: {
        email: '',
        tenantId: '',
        password: ''
      },
      tenantOptions: [],
      loginAttempted: false,
      disableForm: false,
      currentStep: 1
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  static getDerivedStateFromProps = (newProps, prevState) => {
    let { disableForm, loginAttempted } = prevState;
    const { errorMessage, tenantOptions } = newProps.loginStatus;
    const currentStep = tenantOptions.length > 1 ? 2 : 1;

    if (Platform.OS === 'android' && loginAttempted && errorMessage) {
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      disableForm = false;
    }

    disableForm = currentStep === 2 ? false : disableForm;

    return Object.assign({}, prevState, {
      disableForm,
      tenantOptions,
      currentStep
    });
  };

  componentDidUpdate = () => {
    const { loggedIn, user, person } = this.props.loginStatus;
    if (loggedIn) {
      Platform.OS === 'android' &&
        ToastAndroid.show(
          `Welcome, ${person.firstName ? `${person.firstName} ${person.lastName}` : user.email}!`,
          ToastAndroid.LONG
        );
      this.props.navigation.navigate('App');
    }
  };

  onSubmit = data => {
    if (this.state.currentStep === 1) {
      this.setState(
        prevState => {
          const { email, password } = data;
          const formData = { ...prevState.formData, email, password };
          return { formData, disableForm: true, loginAttempted: true };
        },
        () => {
          const { email, password } = this.state.formData;
          this.props.firstLogin({ email, password });
        }
      );
    } else {
      this.setState(
        prevState => {
          const { tenantId } = data;
          const formData = { ...prevState.formData, tenantId };
          return { formData, disableForm: true, loginAttempted: true };
        },
        () => this.props.fullLogin(this.state.formData)
      );
    }
  };

  onCancel = () => {
    if (this.state.currentStep === 1) {
      this.setState({ formData: LoginScreen.defaultForm });
    } else {
      this.setState(prevState => {
        const formData = { ...prevState.formData, tenantId: '' };
        return {
          formData,
          tenantOptions: [],
          currentStep: 1,
          disableForm: false
        };
      });
    }
  };

  render = () => (
    <ScrollView style={styles.scroll}>
      <Header>SeQQure Mobile</Header>
      <LoginForm
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
        currentStep={this.state.currentStep}
        disabled={this.state.disableForm}
      />
      <LoginTenantForm
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
        tenantOptions={this.state.tenantOptions}
        currentStep={this.state.currentStep}
        disabled={this.state.disableForm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 30,
    flexDirection: 'column',
    backgroundColor: '#FAFAFA'
  }
});

const mapStateToProps = state => {
  return { loginStatus: state.loginStatus };
};

const mapDispatchToProps = dispatch => {
  return {
    firstLogin: userWithoutTenant => dispatch(initialLogin(userWithoutTenant)),
    fullLogin: user => dispatch(fullLogin(user))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginScreen);
