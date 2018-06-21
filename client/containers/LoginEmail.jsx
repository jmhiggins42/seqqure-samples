import React from 'react';
import PropTypes from 'prop-types';
import deepmerge from 'deepmerge';

// Services / Utilities
import { FormField, FormFieldConfig, validate as formFieldValidate } from '../helpers/form.helper';
import { checkEmail } from '../services/userService';
import Notifier from '../helpers/notifier';

class LoginEmail extends React.Component {
  static propTypes = {
    formData: PropTypes.shape({
      email: PropTypes.string
    })
  };

  static defaultProps = {
    formData: {
      email: ''
    },
    disableForm: false
  };

  static formDataConfig = {
    email: new FormFieldConfig('Email', {
      required: { value: true, message: 'Email is required' },
      pattern: {
        value: /[\w\d]+@[\w\d]+\.\w+/,
        message: 'Please use a valid email address'
      }
    })
  };

  constructor(props) {
    super(props);

    const formData = this.convertPropsToFormData(props);

    this.state = {
      formData: formData,
      formValid: this.validateForm(formData)
    };

    this.textInput = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const newFormData = this.convertPropsToFormData(nextProps);
    this.setState(
      {
        formData: newFormData,
        formValid: this.validateForm(newFormData)
      },
      this.focusTextInput
    );
  }

  componentDidMount() {
    this.focusTextInput();
  }

  focusTextInput() {
    this.textInput.current && this.textInput.current.focus();
  }

  convertPropsToFormData(thatProps) {
    const thatFormData = { email: thatProps.email };
    let login = deepmerge(LoginEmail.defaultProps.formData, thatFormData);

    const formData = {
      email: new FormField(login.email)
    };

    // Loop through validation for each field
    for (let fieldName in formData) {
      let field = formData[fieldName];
      let config = LoginEmail.formDataConfig[fieldName];
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
    const config = LoginEmail.formDataConfig[name];

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
    const input = { email: this.state.formData.email.value };

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

    this.setState({ disableForm: true });

    // Axios work
    checkEmail(input)
      .then(data => {
        this.setState({ disableForm: false }, () => {
          that.props.afterValid(input.email, data.items);
        });
      })
      .catch(err => {
        this.setState({ disableForm: false }, () =>
          Notifier.error('Error while checking email address: ', err.message)
        );
      });
  }

  renderErrorMsgs(field) {
    return !field.valid && field.touched ? (
      <em className="invalid">{field.brokenRules.map(br => <div key={br.rule}>{br.msg}</div>)}</em>
    ) : null;
  }

  render() {
    if (this.props.currentStep !== 1) {
      return null;
    }

    return (
      <form className="smart-form" onSubmit={this.onSubmit}>
        <fieldset>
          <section>
            <label className="label" htmlFor="email">
              Email Address
            </label>
            <label
              className={
                !this.state.formData.email.valid && this.state.formData.email.touched
                  ? 'input state-error'
                  : 'input'
              }
            >
              <input
                type="text"
                name="email"
                autoComplete="email"
                value={this.state.formData.email.value}
                onChange={this.onChange}
                disabled={this.state.disableForm}
                ref={this.textInput}
              />
            </label>
            {this.renderErrorMsgs(this.state.formData.email)}
          </section>
        </fieldset>
        <footer>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </footer>
      </form>
    );
  }
}

export default LoginEmail;
