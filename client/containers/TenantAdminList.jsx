import React from 'react';
import { Modal } from 'react-bootstrap';

// Components
import AddPersonModal from '../containers/AddPersonModal';

// Services
import { post as addPerson } from '../services/people.service';
import { getAdminsById, getInvitesById } from '../services/tenant.service';
import { sendInvitation, resendInvitation } from '../services/inviteService';

// Utilities
import Notifier from '../helpers/notifier';

class TenantAdminList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      admins: [],
      invitedAdmins: [],
      newInvites: [],
      modalMessage: '',
      addModal: false,
      disableForm: false
    };

    this.onReinvite = this.onReinvite.bind(this);
    this.onAddStart = this.onAddStart.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onHide = this.onHide.bind(this);
  }

  componentDidMount() {
    if (this.props.tenantId) {
      getAdminsById(this.props.tenantId)
        .then(data => {
          this.setState({
            admins: data.items
          });
        })
        .catch(err => {
          if (err.response && err.response.data) {
            Notifier.error(err.response.data.errors);
          } else {
            Notifier.error(`Error in getting Tenant Admins: ${err.message || 'Server error'}`);
          }
        });

      getInvitesById(this.props.tenantId)
        .then(data => {
          this.setState({
            invitedAdmins: data.items
          });
        })
        .catch(err => {
          if (err.response && err.response.data) {
            Notifier.error(err.response.data.errors);
          } else {
            Notifier.error(`Error in getting sent invitations: ${err.message || 'Server error'}`);
          }
        });
    }
  }

  onAddStart() {
    this.setState({ addModal: true });
  }

  onInvite(person, e) {
    const invitation = { personId: person._id };

    sendInvitation(invitation)
      .then(data => {
        Notifier.success(`Invitation sent to ${person.firstName} ${person.lastName}.`);

        this.setState(prevState => {
          const newAdmin = {
            ...person,
            invitation: {
              _id: data.item,
              createdDate: new Date()
            }
          };
          const admins = prevState.admins.map(
            admin => (admin._id === newAdmin._id ? newAdmin : admin)
          );
          return { admins: admins };
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Invitation error: ${err.message}`);
        }
      });
  }

  onReinvite(person) {
    resendInvitation(person.invitation._id)
      .then(data => {
        this.setState(prevState => {
          const invites = prevState.invitedAdmins.map(admin => {
            if (admin._id === person._id) {
              admin.invitation._id = data.item;
              admin.invitation.createdDate = new Date();
              Notifier.success(`Resent invitation to ${admin.firstName} ${admin.lastName}.`);
            }
            return admin;
          });
          return {
            invitedAdmins: invites
          };
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Re-invitation error: ${err.message}`);
        }
      });
  }

  onSubmit(person) {
    // Add in roleCode/tenantId information
    person.roles = [this.props.roleId];
    person.tenantId = this.props.tenantId;

    this.setState({ disableForm: true }, () =>
      // Step 1: Add person
      addPerson(person)
        .then(personData => {
          Notifier.success(`Added ${person.firstName} ${person.lastName} to tenant database.`);

          const invitation = { personId: personData.item };

          // Step 2: Send Invite
          sendInvitation(invitation)
            .then(inviteData => {
              Notifier.success(`Invitation sent to ${person.firstName} ${person.lastName}.`);
              const newInvite = {
                _id: inviteData.item,
                firstName: person.firstName,
                lastName: person.lastName,
                recipient: person.publicEmail,
                createdDate: new Date()
              };
              this.setState(prevState => {
                const newInvites = prevState.newInvites;
                newInvites.push(newInvite);
                return { newInvites, disableForm: false, addModal: false };
              });
            })
            .catch(err => {
              if (err.response && err.response.data) {
                Notifier.error(err.response.data.errors);
              } else {
                Notifier.error(`Invitation error: ${err.message}`);
              }
              this.setState({ disableForm: false });
            });
        })
        .catch(err => {
          if (err.response && err.response.data) {
            Notifier.error(err.response.data.errors);
          } else {
            Notifier.error(`Add person error: ${err.message}`);
          }
          this.setState({ disableForm: false });
        })
    );
  }

  onHide() {
    this.setState({ addModal: false });
  }

  render() {
    const adminLines =
      this.state.admins.length > 0 &&
      this.state.admins
        .sort((a, b) => {
          if (a.lastName.toUpperCase() < b.lastName.toUpperCase()) return -1;
          if (a.lastName.toUpperCase() > b.lastName.toUpperCase()) return 1;
          if (a.firstName.toUpperCase() < b.firstName.toUpperCase()) return -1;
          if (a.firstName.toUpperCase() > b.firstName.toUpperCase()) return 1;
          return 0;
        })
        .map(admin => (
          <div key={admin._id} className="row mb-1">
            <div className="col-xs-7">
              <p className="font-sm">
                <strong>
                  {admin.firstName} {admin.lastName}
                </strong>
                <br />
                {admin.publicEmail}
                {admin.invitation && (
                  <React.Fragment>
                    <br />
                    Sent on {new Date(admin.invitation.createdDate).toDateString()}
                  </React.Fragment>
                )}
              </p>
            </div>
            <div className="col-xs-5">
              <button
                type="button"
                className="btn btn-sm btn-block btn-success"
                onClick={this.onInvite.bind(this, admin)}
                disabled={admin.invitation}
              >
                Invite
              </button>
            </div>
          </div>
        ));

    const invitedAdminLines =
      this.state.invitedAdmins.length > 0 &&
      this.state.invitedAdmins
        .sort((a, b) => {
          if (a.lastName.toUpperCase() < b.lastName.toUpperCase()) return -1;
          if (a.lastName.toUpperCase() > b.lastName.toUpperCase()) return 1;
          if (a.firstName.toUpperCase() < b.firstName.toUpperCase()) return -1;
          if (a.firstName.toUpperCase() > b.firstName.toUpperCase()) return 1;
          if (a.invitation.recipient.toUpperCase() < b.invitation.recipient.toUpperCase())
            return -1;
          if (a.invitation.recipient.toUpperCase() > b.invitation.recipient.toUpperCase()) return 1;
          return 0;
        })
        .map(admin => (
          <div key={admin._id} className="row mb-1">
            <div className={admin.registeredDate ? 'col-xs-12' : 'col-xs-7'}>
              <p className="font-sm">
                <strong>
                  {admin.firstName} {admin.lastName}
                </strong>
                <br />
                {admin.invitation.recipient}
                {!admin.registeredDate && (
                  <React.Fragment>
                    <br />
                    Sent on {new Date(admin.invitation.createdDate).toDateString()}
                  </React.Fragment>
                )}
              </p>
            </div>
            {!admin.registeredDate && (
              <div className="col-xs-5">
                <button
                  type="button"
                  className="btn btn-sm btn-block btn-warning"
                  onClick={this.onReinvite.bind(this, admin)}
                >
                  Re-Invite
                </button>
              </div>
            )}
          </div>
        ));

    const newInviteLines =
      this.state.newInvites.length > 0 &&
      this.state.newInvites.map(invite => (
        <div key={invite._id} className="row mb-1">
          <div className="col-xs-12">
            <p className="font-sm">
              <strong>
                {invite.firstName} {invite.lastName}
              </strong>
              <br />
              {invite.recipient}
              <br />
              Sent on {new Date(invite.createdDate).toDateString()}
            </p>
          </div>
        </div>
      ));

    if (!this.props.tenantId) {
      return 'Please save the tenant first before adding administrators.';
    }

    return (
      <React.Fragment>
        <div className="row mb-2">
          <button
            type="button"
            className="btn btn-primary col-sm-offset-3 col-sm-6"
            onClick={this.onAddStart}
          >
            Invite New Admin
          </button>
        </div>
        {adminLines}
        {invitedAdminLines}
        {newInviteLines}
        <Modal show={this.state.addModal} onHide={this.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Add Tenant Administrator</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddPersonModal
              onSubmit={this.onSubmit}
              onHide={this.onHide}
              message={this.state.modalMessage}
              disableForm={this.state.disableForm}
            />
          </Modal.Body>
        </Modal>
      </React.Fragment>
    );
  }
}

export default TenantAdminList;
