import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

// Components
import FormPanel from '../components/FormPanel';
import PageHeader from '../components/PageHeader';
import Ribbon from '../components/Ribbon';

// Services
import { getByTenantId as getPeople, put as updatePerson } from '../services/people.service';
import { readAll as getRoles } from '../services/security.service';

// Helpers
import { peopleSort, displayOrderSort } from '../helpers/utilities';
import Notifier from '../helpers/notifier';

class SecurityEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      roles: null,
      people: null,
      hoverMap: null
    };

    this.onChange = this.onChange.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  componentDidMount() {
    getRoles()
      .then(data => {
        this.setState({
          roles: data.items,
          hoverMap: data.items.map(role => ({ [role._id]: false }))
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Problem with getting roles: ${err.message || 'Server error'}`);
        }
      });

    getPeople()
      .then(data => {
        this.setState({ people: data.items });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Problem with getting people: ${err.message || 'Server error'}`);
        }
      });
  }

  onChange(selectPerson, selectRole, e) {
    const addRoleMode = e.target.checked;
    let newRoles = selectPerson.roles;
    let msg = '';

    if (addRoleMode) {
      newRoles.push(selectRole._id);
      msg = `Added role ${selectRole.name} to `;
    } else {
      newRoles = newRoles.filter(role => role !== selectRole._id);
      msg = `Removed role ${selectRole.name} from `;
    }

    msg += `${selectPerson.firstName} ${selectPerson.lastName}`;

    selectPerson.roles = newRoles;

    const putObject = {
      _id: selectPerson._id,
      firstName: selectPerson.firstName,
      lastName: selectPerson.lastName,
      publicEmail: selectPerson.publicEmail,
      roles: selectPerson.roles
    };

    updatePerson(putObject)
      .then(data => {
        Notifier.success(msg);
        this.setState(prevState => {
          const newPeople = prevState.people.map(
            person => (person._id === selectPerson._id ? selectPerson : person)
          );
          return { people: newPeople };
        });
      })
      .catch(err => {
        Notifier.error(`Role update to ${selectPerson.firstName} ${selectPerson.lastName} failed.`);
      });
  }

  showTooltip(role, e) {
    this.setState(prevState => {
      return { hoverMap: { ...prevState.hoverMap, [role._id]: true } };
    });
  }

  hideTooltip(role, e) {
    this.setState(prevState => {
      return { hoverMap: { ...prevState.hoverMap, [role._id]: false } };
    });
  }

  render() {
    const rolesLines = person =>
      this.state.roles &&
      this.state.roles.sort(displayOrderSort).map(role => (
        <div key={role._id} className="flexRoles">
          <form className="smart-form">
            <label className="checkbox admin-checkbox">
              <input
                type="checkbox"
                name={`checkbox-${role._id}`}
                checked={person.roles.includes(role._id)}
                value={false}
                onChange={this.onChange.bind(this, person, role)}
              />
              <i />
              <span className="hidden">{role.code}</span>
            </label>
          </form>
        </div>
      ));

    const peopleLines =
      this.state.people &&
      this.state.people.sort(peopleSort).map(person => (
        <div key={person._id} className="row flexBox mt-2 mb-2">
          <div className="flexPerson text-right">
            {person.firstName} {person.lastName}
          </div>
          {rolesLines(person)}
        </div>
      ));

    const roleCodesLines =
      this.state.roles &&
      this.state.roles.sort(displayOrderSort).map(role => (
        <div key={role._id} className="flexRoles text-center">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-${role.code}`}>{role.name}</Tooltip>}
          >
            <strong>{role.code}</strong>
          </OverlayTrigger>
        </div>
      ));

    return (
      <React.Fragment>
        <Ribbon breadcrumbArray={['Tenant Admin', 'Security']} />
        <PageHeader iconClasses="fa fa-lg fa-fw fa-gear" title="Security Roles" subtitle="Edit" />
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <FormPanel title="Edit Security Roles">
                {this.state.roles && this.state.people ? (
                  <React.Fragment>
                    <div className="row flexBox">
                      <div className="flexPerson text-right">
                        <h6>People</h6>
                      </div>
                      {roleCodesLines}
                    </div>
                    {peopleLines}
                  </React.Fragment>
                ) : (
                  'Loading...'
                )}
              </FormPanel>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SecurityEdit;
