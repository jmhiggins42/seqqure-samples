import React from 'react';
import PropTypes from 'prop-types';

// Utilities
import { FormField, FormFieldConfig, validate as formFieldValidate } from '../helpers/form.helper';

class LoginPassword extends React.Component {
  static propTypes = {
    formData: PropTypes.shape({
      password: PropTypes.string
    })
  };

  static defaultProps = {
    formData: {
      password: ''
    }
  };

  static formDataConfig = {
    password: new FormFieldConfig('Password', {
      required: { value: true, message: 'Password is required' },
      pattern: {
        value: /^(?=.*[0-9]).{6,}$/,
        message: 'Password must be at least 6 characters long and contain one number'
      }
    })
  };

  constructor(props) {
    super(props);

    const formData = this.convertPropsToFormData();

    this.state = {
      formData: formData,
      formValid: this.validateForm(formData),
      disableForm: false
    };

    this.textInput = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const newFormData = this.convertPropsToFormData();
    this.setState(
      {
        formData: newFormData,
        formValid: this.validateForm(newFormData),
        disableForm: false
      },
      this.focusTextInput
    );
  }

  focusTextInput() {
    this.textInput.current && this.textInput.current.focus();
  }

  convertPropsToFormData() {
    let login = LoginPassword.defaultProps.formData;

    const formData = {
      password: new FormField(login.password)
    };

    // Loop through validation for each field
    for (let fieldName in formData) {
      let field = formData[fieldName];
      let config = LoginPassword.formDataConfig[fieldName];
      formFieldValidate(field, config, formData);
    }

    return formData;
  }

  validateForm(formData) {
    return Object.values(formData).reduce((accBool, formField) => accBool && formField.valid, true);
  }

  onChange(e) {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const config = LoginPassword.formDataConfig[name];

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

    const that = this;
    const input = { password: this.state.formData.password.value };

    // reset formData
    if (!this.state.formValid) {
      // Mark all fields as touched to display validation errors for all fields
      const formData = JSON.parse(JSON.stringify(this.state.formData));
      for (let fieldIdentifier in formData) {
        formData[fieldIdentifier].touched = true;
      }
      this.setState({ formData: formData });
      return;
    }

    this.setState({ disableForm: true }, () => {
      that.props.afterValid(input.password);
    });
  }

  renderErrorMsgs(field) {
    return !field.valid && field.touched ? (
      <em className="invalid">{field.brokenRules.map(br => <div key={br.rule}>{br.msg}</div>)}</em>
    ) : null;
  }

  render() {
    if (this.props.currentStep !== 3) {
      return null;
    }

    return (
      <form className="smart-form" onSubmit={this.onSubmit}>
        <fieldset>
          <section>
            <label className="label" htmlFor="password">
              Password
            </label>
            <label
              className={
                !this.state.formData.password.valid && this.state.formData.password.touched
                  ? 'input state-error'
                  : 'input'
              }
            >
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={this.state.formData.password.value}
                onChange={this.onChange}
                disabled={this.state.disableForm}
                ref={this.textInput}
              />
            </label>
            {this.renderErrorMsgs(this.state.formData.password)}
          </section>
        </fieldset>
        <footer>
          <button
            type="button"
            className="btn btn-default pull-left"
            onClick={this.props.goBack.bind(this)}
          >
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </footer>
      </form>
    );
  }
}

export default LoginPassword;
