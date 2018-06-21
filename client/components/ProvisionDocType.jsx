import React from 'react';

const ProvisionDocType = ({ choices, onSelect, onSelectAll, onProvision, disableBtn }) => {
  const selectableChoices = choices.filter(docType => !docType.provisioned);

  const numChoicesSelected = selectableChoices.filter(choice => choice.selected).length;

  return (
    <div className="row">
      <div className="col-sm-8">
        <div className="dataTables_wrapper form-inline dt-bootstrap no-footer">
          <table className="table table-bordered table-striped table-hover table-condensed dataTable smart-form has-tickbox">
            <thead>
              <tr>
                <th>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      name="selectAll"
                      checked={
                        selectableChoices.length !== 0 &&
                        selectableChoices.every(docType => docType.selected)
                      }
                      value={false}
                      onChange={onSelectAll}
                    />
                    <i />
                  </label>
                </th>
                <th>Document Type</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {choices.sort((a, b) => a.displayOrder - b.displayOrder).map(docType => (
                <tr key={docType._id} onClick={onSelect.bind(this, docType)}>
                  <td>
                    <label className={docType.provisioned ? 'checkbox state-disabled' : 'checkbox'}>
                      <input
                        type="checkbox"
                        name="selected"
                        checked={docType.selected}
                        value={false}
                        onChange={onSelect.bind(this, docType)}
                        disabled={docType.provisioned ? 'disabled' : ''}
                      />
                      <i />
                    </label>
                  </td>
                  <td>{docType.provisioned ? <s>{docType.docuName}</s> : docType.docuName}</td>
                  <td>{docType.provisioned ? <s>{docType.docuCode}</s> : docType.docuCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="col-sm-4">
        <p />
        <div className="row mb-2">
          <button
            type="button"
            className="btn btn-lg btn-success col-xs-offset-3 col-xs-6"
            onClick={onProvision}
            disabled={disableBtn}
          >
            Copy
          </button>
        </div>
        <div className="row jumbotron">
          <h1 className="text-center">
            {numChoicesSelected}
            <p>{` document ${numChoicesSelected === 1 ? 'type' : 'types'} selected`}</p>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default ProvisionDocType;
