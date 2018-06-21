import React from 'react';
import { connect } from 'react-redux';
import { login } from '../actions/loginActions';

// Components
import Ribbon from '../components/Ribbon';
import LoginEmail from './LoginEmail';
import LoginTenant from './LoginTenant';
import LoginPassword from './LoginPassword';
import FormPanel from '../components/FormPanel';

// Utilities
import Notifier from '../helpers/notifier';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {
        email: '',
        tenantId: '',
        password: ''
      },
      loginAttempted: false,
      tenants: [],
      previousStep: null,
      currentStep: 1
    };

    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { location, history, loginStatus } = nextProps;
    const { loginPending, loggedIn, errorMessage, user, person } = loginStatus;

    const jumpToPage =
      location.state && location.state.from
        ? location.state.from.pathname
            .split('/')
            .splice(0, 2)
            .join('/')
            .replace('readContentPage', '') + location.state.from.search
        : '/';

    if (this.state.loginAttempted && loginPending) Notifier.info('Logging in...');
    if (this.state.loginAttempted && errorMessage) Notifier.error(errorMessage);
    if (loggedIn) {
      Notifier.success(
        `Welcome, ${person.firstName ? `${person.firstName} ${person.lastName}` : user.email}`
      );
      history.push(jumpToPage);
    }
  }

  nextStep(data, tenants) {
    const that = this;
    let name = '';
    let value = data;
    let currentStep = this.state.currentStep;
    const previousStep = this.state.currentStep;

    switch (this.state.currentStep) {
      case 2:
        name = 'tenantId';
        break;

      case 3:
        name = 'password';
        break;

      default:
        name = 'email';
        break;
    }

    if (currentStep >= 2) {
      currentStep = 3;
    } else {
      currentStep++;
    }

    this.setState(
      prevState => {
        const currFormData = { ...prevState.formData, [name]: value };
        return {
          formData: currFormData,
          previousStep: previousStep,
          currentStep: currentStep,
          tenants: tenants || prevState.tenants
        };
      },
      () => {
        // Step THROUGH tenants page in case user is only assigned to one tenant
        if (previousStep === 1 && this.state.tenants.length === 1) {
          this.nextStep(this.state.tenants[0]._id);
        }

        // Attempt Login once
        if (previousStep === 3) {
          this.setState({ loginAttempted: true }, () => that.props.loginUser(this.state.formData));
        }
      }
    );
  }

  prevStep() {
    let currentStep = this.state.currentStep;
    const previousStep = this.state.currentStep;

    if (currentStep <= 1 || this.state.tenants.length === 1) {
      currentStep = 1;
    } else {
      currentStep--;
    }

    this.setState(prevState => {
      const currFormData = { ...prevState.formData, password: '' };
      return {
        formData: currFormData,
        previousStep: previousStep,
        currentStep: currentStep
      };
    });
  }

  render() {
    const stepName =
      this.state.currentStep === 1 ? 'Email' : this.state.currentStep === 2 ? 'Tenant' : 'Password';

    const title = (
      <span>
        <i className="fa fa-fw fa-check" />Login - {stepName}
      </span>
    );

    return (
      <React.Fragment>
        <Ribbon breadcrumbArray={['Login']} />
        <div className="row" style={{ paddingTop: '100px' }}>
          <div className="col-sm-offset-3 col-sm-6">
            <FormPanel title={title}>
              <LoginEmail
                currentStep={this.state.currentStep}
                afterValid={this.nextStep}
                email={this.state.formData.email}
              />
              <LoginTenant
                currentStep={this.state.currentStep}
                afterValid={this.nextStep}
                goBack={this.prevStep}
                tenants={this.state.tenants}
                tenantId={this.state.formData.tenantId}
              />
              <LoginPassword
                currentStep={this.state.currentStep}
                afterValid={this.nextStep}
                goBack={this.prevStep}
              />
            </FormPanel>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return { loginStatus: state.loginStatus };
};

const mapDispatchToProps = dispatch => {
  return { loginUser: user => dispatch(login(user)) };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
