import React from 'react';

// Components
import Accordion from '../components/Accordion';
import AccordionPanel from '../components/AccordionPanel';
import ProvisionDocType from '../components/ProvisionDocType';
import ProvisionEscrowTemplate from '../components/ProvisionEscrowTemplate';
import ProvisionTransactionType from '../components/ProvisionTransactionType';

// Services
import {
  getAllMaster as getEscrowTemplates,
  provision as eTempProvision
} from '../services/escrowTemplate.service';
import {
  getAllMaster as getDocTypes,
  provision as docTypeProvision
} from '../services/documentType.service';
import { readAll as getTenants } from '../services/tenant.service';
import {
  getAllMaster as getTransactionTypes,
  provision as tTypeProvision
} from '../services/transactionService';

// Utilities/Constants
import Notifier from '../helpers/notifier';
import * as constants from '../constants';

class TenantConfig extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      provisionTenant: null,
      selectedId: constants.SEQQURE_ID,
      sourceTenants: [],
      docTypes: [],
      transactionTypes: [],
      escrowTemplates: [],
      panelKey: null
    };

    // Component-Level Handlers
    this.tenantSelect = this.tenantSelect.bind(this);
    this.panelSelect = this.panelSelect.bind(this);

    // Document Type Handlers
    this.docTypeSelectAll = this.docTypeSelectAll.bind(this);
    this.docTypeSelect = this.docTypeSelect.bind(this);
    this.provisionDocTypes = this.provisionDocTypes.bind(this);

    // Transaction Type Handlers
    this.tTypeSelectAll = this.tTypeSelectAll.bind(this);
    this.tTypeSelect = this.tTypeSelect.bind(this);
    this.provisionTTypes = this.provisionTTypes.bind(this);

    // Escrow Template Handlers
    this.eTempSelectAll = this.eTempSelectAll.bind(this);
    this.eTempSelect = this.eTempSelect.bind(this);
    this.provisionETemps = this.provisionETemps.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);

    const provisionId = this.props.match.params.tenantId;

    // Tenants
    const tenantPromise = getTenants()
      .then(data => data.items)
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Error in getting tenants: ${err.message || 'Server error'}`);
        }
      });

    // DocTypes
    const docTypePromise = getDocTypes()
      .then(data => {
        const docTypes = data.items;
        const provisionedSourceIds = docTypes
          .filter(dType => dType.tenantId === provisionId)
          .map(dType => dType.sourceId)
          .filter(el => el);

        return docTypes.map(docType => {
          docType.selected = false;
          docType.provisioned = provisionedSourceIds.includes(docType._id);
          return docType;
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Error in getting document types: ${err.message || 'Server error'}`);
        }
      });

    // TransactionTypes
    const transactionTypePromise = getTransactionTypes()
      .then(data => {
        const tTypes = data.items;
        const provisionedSourceIds = tTypes
          .filter(tType => tType.tenantId === provisionId)
          .map(tType => tType.sourceId)
          .filter(el => el);

        return tTypes.map(tType => {
          tType.selected = false;
          tType.provisioned = provisionedSourceIds.includes(tType._id);
          return tType;
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Error in getting transaction types: ${err.message || 'Server error'}`);
        }
      });

    // EscrowTemplates
    const escrowTemplatePromise = getEscrowTemplates()
      .then(data => {
        const eTemps = data.items;
        const provisionedSourceIds = eTemps
          .filter(eTemp => eTemp.tenantId === provisionId)
          .map(eTemp => eTemp.sourceId)
          .filter(el => el);

        return eTemps.map(eTemp => {
          eTemp.selected = false;
          eTemp.provisioned = provisionedSourceIds.includes(eTemp._id);
          return eTemp;
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Error in getting escrow templates: ${err.message || 'Server error'}`);
        }
      });

    Promise.all([
      tenantPromise,
      docTypePromise,
      transactionTypePromise,
      escrowTemplatePromise
    ]).then(values => {
      const [tenants, docTypes, transactionTypes, escrowTemplates] = values;
      const provisionTenant = tenants.find(tenant => tenant._id === provisionId);
      const sourceTenants = tenants.filter(tenant => tenant._id !== provisionId);
      this.setState({
        provisionTenant,
        sourceTenants,
        docTypes,
        transactionTypes,
        escrowTemplates,
        panelKey: '1'
      });
    });
  }

  /////////////////////////////////////////
  // COMPONENT-LEVEL HANDLERS
  /////////////////////////////////////////
  tenantSelect(e) {
    const value = e.target.value;
    this.setState(prevState => {
      const docTypes = prevState.docTypes.map(docType => {
        docType.selected = false;
        return docType;
      });
      const transactionTypes = prevState.transactionTypes.map(tType => {
        tType.selected = false;
        return tType;
      });
      const escrowTemplates = prevState.escrowTemplates.map(eTemp => {
        eTemp.selected = false;
        return eTemp;
      });
      return { selectedId: value, docTypes, transactionTypes, escrowTemplates };
    });
  }

  panelSelect(panelKey) {
    this.setState({ panelKey });
  }

  /////////////////////////////////////////
  // DOCUMENT TYPE HANDLERS
  /////////////////////////////////////////
  docTypeSelectAll() {
    this.setState(prevState => {
      const filteredDocTypes = prevState.docTypes.filter(
        docType =>
          !docType.isObsolete && docType.tenantId === prevState.selectedId && !docType.provisioned
      );
      const filteredIds = filteredDocTypes.map(docType => docType._id);

      const someSelected = filteredDocTypes.some(docType => docType.selected);
      const docTypes = prevState.docTypes.map(docType => {
        docType.selected = filteredIds.includes(docType._id) ? !someSelected : false;
        return docType;
      });
      return { docTypes };
    });
  }

  docTypeSelect(selectedDType) {
    if (!selectedDType.provisioned) {
      this.setState(prevState => {
        const { _id: id } = selectedDType;
        const docTypes = prevState.docTypes.map(docType => {
          docType.selected = docType._id === id ? !docType.selected : docType.selected;
          return docType;
        });
        return { docTypes };
      });
    }
  }

  provisionDocTypes() {
    const selectedDocTypes = this.state.docTypes.filter(docType => docType.selected);
    const selectedIds = selectedDocTypes.map(docType => docType._id);

    if (selectedIds.length === 0) {
      Notifier.error('Please select some document types first.');
      return;
    }

    docTypeProvision({ selectedIds }, this.state.provisionTenant._id)
      .then(data => {
        Notifier.success(
          `Successfully provisioned ${data.item.insertedCount} document ${
            data.item.insertedCount === 1 ? 'type' : 'types'
          }!`
        );
        this.setState(prevState => {
          const docTypes = prevState.docTypes.map(docType => {
            docType.selected = false;
            docType.provisioned = docType.provisioned || selectedIds.includes(docType._id);
            return docType;
          });
          return { docTypes, panelKey: '2' };
        });
      })
      .catch(err => {
        if (err.response && err.response.data) {
          Notifier.error(err.response.data.errors);
        } else {
          Notifier.error(`Error in provisioning document types: ${err.message || 'Server error'}`);
        }
      });
  }

  /////////////////////////////////////////
  // TRANSACTION TYPE HANDLERS
  /////////////////////////////////////////
  tTypeSelectAll() {
    this.setState(prevState => {
      const filteredTransactionTypes = prevState.transactionTypes.filter(
        tType => !tType.isObsolete && tType.tenantId === prevState.selectedId && !tType.provisioned
      );
      const filteredIds = filteredTransactionTypes.map(tType => tType._id);

      const someSelected = filteredTransactionTypes.some(tType => tType.selected);
      const transactionTypes = prevState.transactionTypes.map(tType => {
        tType.selected = filteredIds.includes(tType._id) ? !someSelected : false;
        return tType;
      });
      return { transactionTypes };
    });
  }

  tTypeSelect(selectedTType) {
    if (!selectedTType.provisioned) {
      this.setState(prevState => {
        const { _id: id } = selectedTType;
        const transactionTypes = prevState.transactionTypes.map(tType => {
          tType.selected = tType._id === id ? !tType.selected : tType.selected;
          return tType;
        });
        return { transactionTypes };
      });
    }
  }

  provisionTTypes() {
    const selectedTTypes = this.state.transactionTypes.filter(tType => tType.selected);
    const selectedIds = selectedTTypes.map(tType => tType._id);

    if (selectedIds.length === 0) {
      Notifier.error('Please select some transaction types first.');
      return;
    }

    tTypeProvision({ selectedIds }, this.state.provisionTenant._id)
      .then(data => {
        Notifier.success(
          `Successfully provisioned ${data.item.insertedCount} transaction ${
            data.item.insertedCount === 1 ? 'type' : 'types'
          }!`
        );
        this.setState(prevState => {
          const transactionTypes = prevState.transactionTypes.map(tType => {
            tType.selected = false;
            tType.provisioned = tType.provisioned || selectedIds.includes(tType._id);
            return tType;
          });
          return { transactionTypes, panelKey: '3' };
        });
      })
      .catch(err => {
        if (err.response && err.response.data) Notifier.error(err.response.data.errors);
        else Notifier.error(`Error in getting transaction types: ${err.message || 'Server error'}`);
      });
  }

  /////////////////////////////////////////
  // ESCROW TEMPLATE HANDLERS
  /////////////////////////////////////////
  eTempSelectAll() {
    this.setState(prevState => {
      const filteredEscrowTemplates = prevState.escrowTemplates.filter(
        eTemp => eTemp.tenantId === prevState.selectedId && !eTemp.provisioned
      );
      const filteredIds = filteredEscrowTemplates.map(eTemp => eTemp._id);

      const someSelected = filteredEscrowTemplates.some(eTemp => eTemp.selected);
      const escrowTemplates = prevState.escrowTemplates.map(eTemp => {
        eTemp.selected = filteredIds.includes(eTemp._id) ? !someSelected : false;
        return eTemp;
      });
      return { escrowTemplates };
    });
  }

  eTempSelect(selectedETemp) {
    if (!selectedETemp.provisioned) {
      this.setState(prevState => {
        const { _id: id } = selectedETemp;
        const escrowTemplates = prevState.escrowTemplates.map(eTemp => {
          eTemp.selected = eTemp._id === id ? !eTemp.selected : eTemp.selected;
          return eTemp;
        });
        return { escrowTemplates };
      });
    }
  }

  provisionETemps() {
    const selectedETemps = this.state.escrowTemplates.filter(eTemp => eTemp.selected);
    const selectedIds = selectedETemps.map(eTemp => eTemp._id);

    if (selectedIds.length === 0) {
      Notifier.error('Please select some escrow templates first.');
      return;
    }

    eTempProvision({ selectedIds }, this.state.provisionTenant._id)
      .then(data => {
        if (data.item.transactionTypes) {
          Notifier.success(
            `Successfully provisioned ${data.item.transactionTypes.insertedCount} transaction ${
              data.item.transactionTypes.insertedCount === 1 ? 'type' : 'types'
            }!`
          );
        }

        if (data.item.milestones) {
          if (data.item.milestones.documentTypes) {
            Notifier.success(
              `Successfully provisioned ${
                data.item.milestones.documentTypes.insertedCount
              } document ${
                data.item.milestones.documentTypes.insertedCount === 1 ? 'type' : 'types'
              }!`
            );
          }
          Notifier.success(
            `Successfully provisioned ${data.item.milestones.milestones.insertedCount} ${
              data.item.milestones.milestones.insertedCount === 1 ? 'milestone' : 'milestones'
            }!`
          );
        }

        Notifier.success(
          `Successfully provisioned ${data.item.escrowTemplates.insertedCount} escrow ${
            data.item.escrowTemplates.insertedCount === 1 ? 'template' : 'templates'
          }!`
        );

        this.setState(prevState => {
          const escrowTemplates = prevState.escrowTemplates.map(eTemp => {
            eTemp.selected = false;
            eTemp.provisioned = eTemp.provisioned || selectedIds.includes(eTemp._id);
            return eTemp;
          });
          return { escrowTemplates, panelKey: null };
        });
      })
      .catch(err => {
        if (err.response && err.response.data) Notifier.error(err.response.data.errors);
        else
          Notifier.error(
            `Error in provisioning escrow templates: ${err.message || 'Server error'}`
          );
      });
  }

  render() {
    const filteredDocTypes = this.state.docTypes.filter(
      docType => !docType.isObsolete && docType.tenantId === this.state.selectedId
    );

    const filteredTransactionTypes = this.state.transactionTypes.filter(
      tType => !tType.isObsolete && tType.tenantId === this.state.selectedId
    );

    const filteredEscrowTemplates = this.state.escrowTemplates.filter(
      eTemp => eTemp.tenantId === this.state.selectedId
    );

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-sm-offset-1 col-sm-10">
            <div className="row">
              <form className="smart-form">
                <section className="col col-3" />
                <section className="col col-6">
                  <label className="label" htmlFor="sourceTenant">
                    <h6 className="text-center">Source Tenant</h6>
                  </label>
                  <label className="select">
                    <select
                      name="sourceTenant"
                      value={this.state.selectedId}
                      onChange={this.tenantSelect}
                    >
                      <option value="">Select a Tenant</option>
                      {this.state.sourceTenants
                        .sort((a, b) => a.tenantName - b.tenantName)
                        .map((tenant, i) => (
                          <option key={i} value={tenant._id}>
                            {tenant.tenantName}
                          </option>
                        ))}
                    </select>
                    <i />
                  </label>
                </section>
              </form>
            </div>
            <Accordion
              id="tenant-config"
              activeKey={this.state.panelKey}
              onSelect={this.panelSelect}
            >
              <AccordionPanel
                eventKey="1"
                currentKey={this.state.panelKey}
                title="Document Types"
                bsStyle={this.state.panelKey === '1' ? 'primary' : 'info'}
              >
                <ProvisionDocType
                  choices={filteredDocTypes}
                  onSelect={this.docTypeSelect}
                  onSelectAll={this.docTypeSelectAll}
                  onProvision={this.provisionDocTypes}
                  disableBtn={
                    this.state.docTypes &&
                    !this.state.docTypes.filter(docType => docType.selected).length
                  }
                />
              </AccordionPanel>
              <AccordionPanel
                eventKey="2"
                currentKey={this.state.panelKey}
                title="Transaction Types"
                bsStyle={this.state.panelKey === '2' ? 'primary' : 'info'}
              >
                <ProvisionTransactionType
                  choices={filteredTransactionTypes}
                  onSelect={this.tTypeSelect}
                  onSelectAll={this.tTypeSelectAll}
                  onProvision={this.provisionTTypes}
                  disableBtn={
                    this.state.transactionTypes &&
                    !this.state.transactionTypes.filter(tType => tType.selected).length
                  }
                />
              </AccordionPanel>
              <AccordionPanel
                eventKey="3"
                currentKey={this.state.panelKey}
                title="Escrow Templates"
                bsStyle={this.state.panelKey === '3' ? 'primary' : 'info'}
              >
                <ProvisionEscrowTemplate
                  choices={filteredEscrowTemplates}
                  onSelect={this.eTempSelect}
                  onSelectAll={this.eTempSelectAll}
                  onProvision={this.provisionETemps}
                  disableBtn={
                    this.state.escrowTemplates &&
                    !this.state.escrowTemplates.filter(eTemp => eTemp.selected).length
                  }
                />
              </AccordionPanel>
            </Accordion>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default TenantConfig;
