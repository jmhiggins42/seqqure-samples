import React from 'react';
import PropTypes from 'prop-types';
import deepmerge from 'deepmerge';

// Utilities
import { FormField, FormFieldConfig, validate as formFieldValidate } from '../helpers/form.helper';

class LoginTenant extends React.Component {
  static propTypes = {
    formData: PropTypes.shape({
      tenantId: PropTypes.string
    })
  };

  static defaultProps = {
    formData: {
      tenantId: ''
    }
  };

  static formDataConfig = {
    tenantId: new FormFieldConfig('TenantId', {
      required: { value: true, message: 'Tenant is required' }
    })
  };

  constructor(props) {
    super(props);

    const formData = this.convertPropsToFormData(props);

    this.state = {
      formData: formData,
      formValid: this.validateForm(formData)
    };

    this.selectInput = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const newFormData = !nextProps.tenants.map(tenant => tenant._id).includes(nextProps.tenantId)
      ? this.convertPropsToFormData({ tenantId: '' })
      : this.convertPropsToFormData(nextProps);

    this.setState(
      {
        formData: newFormData,
        formValid: this.validateForm(newFormData)
      },
      this.focusSelectInput
    );
  }

  focusSelectInput() {
    this.selectInput.current && this.selectInput.current.focus();
  }

  convertPropsToFormData(thatProps) {
    const thatFormData = { tenantId: thatProps.tenantId };
    let tenant = deepmerge(LoginTenant.defaultProps.formData, thatFormData);

    const formData = {
      tenantId: new FormField(tenant.tenantId)
    };

    // Loop through validation for each field
    for (let fieldName in formData) {
      let field = formData[fieldName];
      let config = LoginTenant.formDataConfig[fieldName];

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
    const config = LoginTenant.formDataConfig[name];

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
    const input = { tenantId: this.state.formData.tenantId.value };

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
      that.props.afterValid(input.tenantId);
    });
  }

  renderErrorMsgs(field) {
    return !field.valid && field.touched ? (
      <em className="invalid">{field.brokenRules.map(br => <div key={br.rule}>{br.msg}</div>)}</em>
    ) : null;
  }

  render() {
    if (this.props.currentStep !== 2) {
      return null;
    }

    return (
      <form className="smart-form" onSubmit={this.onSubmit}>
        <fieldset>
          <section>
            <label className="label" htmlFor="tenantId">
              Tenant
            </label>
            <label
              className={
                !this.state.formData.tenantId.valid && this.state.formData.tenantId.touched
                  ? 'select state-error'
                  : 'select'
              }
            >
              <select
                name="tenantId"
                value={this.state.formData.tenantId.value}
                onChange={this.onChange}
                ref={this.selectInput}
              >
                <option value="">Select a Tenant</option>
                {this.props.tenants.map(tenant => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.tenantName}
                  </option>
                ))}
              </select>
              <i />
            </label>
            {this.renderErrorMsgs(this.state.formData.tenantId)}
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

export default LoginTenant;
