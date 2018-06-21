import React from 'react';
import { connect } from 'react-redux';
import { getInfo, logout } from '../actions/loginActions';

// Components
import RegisterForm from './RegisterForm';

// Services
import { checkInvitation, registerPerson } from '../services/inviteService';

// Utilities
import Notifier from '../helpers/notifier';
import { parseKeyFromSearch } from '../helpers/utilities';

class Register extends React.Component {
  constructor(props) {
    super(props);

    const token = parseKeyFromSearch(window.location.search, 'token');

    this.state = {
      inviteToken: token || '',
      personId: null,
      tenant: null,
      escrow: null,
      role: null,
      formData: null,
      message: '',
      isRegistered: false,
      disableForm: false
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const { history } = this.props;

    checkInvitation(this.state.inviteToken)
      .then(data => {
        const formData = {
          firstName: data.item.firstName,
          lastName: data.item.lastName,
          loginEmail: data.item.email
        };

        const tenant = {
          _id: data.item.tenantId,
          tenantName: data.item.tenantName
        };

        const escrow = {
          _id: data.item.escrowId || null,
          escrowNumber: data.item.escrowNumber || null,
          street: data.item.street || null,
          transactionType: data.item.transactionType || null
        };

        const role = {
          _id: data.item.roleId,
          name: data.item.role
        };

        this.setState({
          personId: data.item.personId,
          tenant,
          escrow,
          role,
          formData
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Unable to retrieve invite information: ${err.message}`);
        }

        history.push('/');
      });
  }

  static getDerivedStateFromProps = (newProps, prevState) => {
    const {
      history,
      loginStatus: { loggedIn }
    } = newProps;

    if (prevState.isRegistered && loggedIn) history.push('/');
    if (!prevState.isRegistered && loggedIn) newProps.logoutUser();
  };

  onSubmit = user => {
    const that = this;

    user.invitationId = this.state.inviteToken;
    user.personId = this.state.personId;
    user.roleId = this.state.role._id;
    user.tenantId = this.state.tenant._id;
    user.escrowId = this.state.escrow._id || '';

    this.setState({ disableForm: true }, () =>
      registerPerson(user)
        .then(data => {
          Notifier.success('Successfully Registered!');
          that.setState({ isRegistered: true }, () => that.props.getInfo());
        })
        .catch(err => {
          if (err.response && err.response.data) {
            Notifier.error(err.response.data.errors);
          } else {
            Notifier.error('Registration failed: ', err.message);
          }
          that.setState({ disableForm: false });
        })
    );
  };

  render() {
    return (
      <React.Fragment>
        <div className="container" style={{ paddingTop: '30px' }}>
          <div className="row">
            <div className="col-sm-offset-3 col-sm-6">
              {this.state.formData && (
                <React.Fragment>
                  <RegisterForm
                    formData={this.state.formData}
                    onSubmit={this.onSubmit}
                    disableForm={this.state.disableForm}
                  >
                    {this.state.tenant._id && (
                      <div>
                        {this.state.role.name} Registration to {this.state.tenant.tenantName}
                      </div>
                    )}
                    {this.state.escrow._id && (
                      <div>
                        EscrowNumber: {this.state.escrow.escrowNumber} ({
                          this.state.escrow.transactionType
                        }, {this.state.escrow.street})
                      </div>
                    )}
                  </RegisterForm>
                  {this.state.message && <div>{this.state.message}</div>}
                </React.Fragment>
              )}
            </div>
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
  return {
    getInfo: () => dispatch(getInfo()),
    logoutUser: () => dispatch(logout())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
