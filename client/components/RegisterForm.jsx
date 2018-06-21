import React from 'react';
import PropTypes from 'prop-types';
import deepmerge from 'deepmerge';

// Components
import FormPanel from '../components/FormPanel';

// Helper Functions
import { FormField, FormFieldConfig, validate as formFieldValidate } from '../helpers/form.helper';

class RegisterForm extends React.Component {
  static propTypes = {
    formData: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      loginEmail: PropTypes.string,
      password: PropTypes.string,
      cPassword: PropTypes.string
    })
  };

  static defaultProps = {
    formData: {
      firstName: '',
      lastName: '',
      loginEmail: '',
      password: '',
      cPassword: ''
    }
  };

  static formDataConfig = {
    firstName: new FormFieldConfig('First Name', {
      required: { value: true, message: 'First Name is required' }
    }),
    lastName: new FormFieldConfig('Last Name', {
      required: { value: true, message: 'Last Name is required' }
    }),
    loginEmail: new FormFieldConfig('Email', {
      required: { value: true, message: 'Email is required' },
      pattern: {
        value: /[\w\d]+@[\w\d]+\.\w+/,
        message: 'Please enter a valid email address'
      }
    }),
    password: new FormFieldConfig('Password', {
      required: { value: true, message: 'Password is required' },
      pattern: {
        value: /^(?=.*[0-9]).{6,}$/,
        message: 'Password must be at least 6 characters long and contain one number'
      }
    }),
    cPassword: new FormFieldConfig('Confirm Password', {
      required: { value: true, message: 'Password is required' },
      pattern: {
        value: /^(?=.*[0-9]).{6,}$/,
        message: 'Password must be at least 6 characters long and contain one number'
      },
      equalTo: { value: 'password', message: 'Passwords must match' }
    })
  };

  constructor(props) {
    super(props);

    const formData = this.convertPropsToFormData(props);

    this.state = {
      formData: formData,
      formValid: this.validateForm(formData)
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  convertPropsToFormData(thatProps) {
    let login = deepmerge(RegisterForm.defaultProps.formData, thatProps.formData);

    const formData = {
      firstName: new FormField(login.firstName),
      lastName: new FormField(login.lastName),
      loginEmail: new FormField(login.loginEmail),
      password: new FormField(login.password),
      cPassword: new FormField(login.cPassword)
    };

    // Loop through validation for each field
    for (let fieldName in formData) {
      let field = formData[fieldName];
      let config = RegisterForm.formDataConfig[fieldName];
      formFieldValidate(field, config, formData);
    }

    return formData;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ disableForm: nextProps.disableForm });
  }

  validateForm(formData) {
    return Object.values(formData).reduce((accBool, formField) => accBool && formField.valid, true);
  }

  onChange(e) {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const config = RegisterForm.formDataConfig[name];

    this.setState(prevState => {
      const field = { ...prevState.formData[name] };

      field.value = value;
      field.touched = true;
      formFieldValidate(field, config, prevState.formData);

      const formData = { ...prevState.formData, [name]: field };
      let formValid = this.validateForm(formData);

      return { formData: formData, formValid: formValid };
    });
  }

  onSubmit(e) {
    e.preventDefault();

    // reset formData
    if (!this.state.formValid) {
      // Mark all fields as touched to display validation errors for all fields
      const formData = JSON.parse(JSON.stringify(this.state.formData));
      for (let fieldIdentifier in formData) {
        formData[fieldIdentifier].touched = false;
      }
      this.setState({ formData: formData });
      return;
    }

    const user = {
      firstName: this.state.formData.firstName.value,
      lastName: this.state.formData.lastName.value,
      loginEmail: this.state.formData.loginEmail.value,
      password: this.state.formData.password.value
    };

    this.props.onSubmit(user);
  }

  renderErrorMsgs(field) {
    return !field.valid && field.touched ? (
      <em className="invalid">{field.brokenRules.map(br => <div key={br.rule}>{br.msg}</div>)}</em>
    ) : null;
  }

  render() {
    const inputClassNames = (inputField, baseClassName = 'input') =>
      !inputField.valid && inputField.touched ? `${baseClassName} state-error` : `${baseClassName}`;

    const title = (
      <span>
        <i className="fa fa-pencil" /> Register
      </span>
    );

    return (
      <FormPanel title={title}>
        <form className="smart-form" onSubmit={this.onSubmit}>
          {this.props.children && <header>{this.props.children}</header>}
          <fieldset>
            <section>
              <label className="label" htmlFor="firstName">
                First Name
              </label>
              <label className={inputClassNames(this.state.formData.firstName)}>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  autoComplete="given-name"
                  value={this.state.formData.firstName.value}
                  onChange={this.onChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.formData.firstName)}
            </section>
            <section>
              <label className="label" htmlFor="lastName">
                Last Name
              </label>
              <label className={inputClassNames(this.state.formData.lastName)}>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  value={this.state.formData.lastName.value}
                  onChange={this.onChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.formData.lastName)}
            </section>
            <section>
              <label className="label" htmlFor="loginEmail">
                Email Address
              </label>
              <label className={inputClassNames(this.state.formData.loginEmail)}>
                <input
                  type="text"
                  name="loginEmail"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={this.state.formData.loginEmail.value}
                  onChange={this.onChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.formData.loginEmail)}
            </section>
            <section>
              <label className="label" htmlFor="password">
                Password
              </label>
              <label className={inputClassNames(this.state.formData.password)}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={this.state.formData.password.value}
                  onChange={this.onChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.formData.password)}
            </section>
            <section>
              <label className="label" htmlFor="cPassword">
                Confirm Password
              </label>
              <label className={inputClassNames(this.state.formData.cPassword)}>
                <input
                  type="password"
                  name="cPassword"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={this.state.formData.cPassword.value}
                  onChange={this.onChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.formData.cPassword)}
            </section>
          </fieldset>
          <footer>
            <button type="submit" className="btn btn-primary" disabled={this.props.disableForm}>
              Submit
            </button>
          </footer>
        </form>
      </FormPanel>
    );
  }
}

export default RegisterForm;
