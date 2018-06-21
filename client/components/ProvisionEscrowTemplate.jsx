import React from 'react';

const ProvisionEscrowTemplate = ({ choices, onSelect, onSelectAll, onProvision, disableBtn }) => {
  const selectableChoices = choices.filter(eTemp => !eTemp.provisioned);

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
                        selectableChoices.every(eTemp => eTemp.selected)
                      }
                      value={false}
                      onChange={onSelectAll}
                    />
                    <i />
                  </label>
                </th>
                <th>Escrow Template</th>
                <th>Trasaction Type</th>
                <th># of Days</th>
                <th># of milestones</th>
              </tr>
            </thead>
            <tbody>
              {choices &&
                choices
                  .sort((a, b) => {
                    if (a.name.toUpperCase() < b.name.toUpperCase()) return -1;
                    if (a.name.toUpperCase() > b.name.toUpperCase()) return 1;
                    return 0;
                  })
                  .map(eTemp => (
                    <tr key={eTemp._id} onClick={onSelect.bind(this, eTemp)}>
                      <td>
                        <label
                          className={eTemp.provisioned ? 'checkbox state-disabled' : 'checkbox'}
                        >
                          <input
                            type="checkbox"
                            name="selected"
                            checked={eTemp.selected}
                            value={false}
                            onChange={onSelect.bind(this, eTemp)}
                            disabled={eTemp.provisioned ? 'disabled' : ''}
                          />
                          <i />
                        </label>
                      </td>
                      <td>{eTemp.provisioned ? <s>{eTemp.name}</s> : eTemp.name}</td>
                      <td>
                        {eTemp.provisioned ? <s>{eTemp.transactionType}</s> : eTemp.transactionType}
                      </td>
                      <td>{eTemp.provisioned ? <s>{eTemp.days}</s> : eTemp.days}</td>
                      <td>
                        {eTemp.provisioned ? (
                          <s>{eTemp.milestones.length}</s>
                        ) : (
                          eTemp.milestones.length
                        )}
                      </td>
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
            <p>{` escrow ${numChoicesSelected === 1 ? 'template' : 'templates'} selected`}</p>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default ProvisionEscrowTemplate;
