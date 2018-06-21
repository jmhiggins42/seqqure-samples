import React from 'react';

const ProvisionTransactionType = ({ choices, onSelect, onSelectAll, onProvision, disableBtn }) => {
  const selectableChoices = choices.filter(tType => !tType.provisioned);

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
                        selectableChoices.every(tType => tType.selected)
                      }
                      value={false}
                      onChange={onSelectAll}
                    />
                    <i />
                  </label>
                </th>
                <th>Transaction Type</th>
              </tr>
            </thead>
            <tbody>
              {choices &&
                choices.sort((a, b) => a.displayOrder - b.displayOrder).map(tType => (
                  <tr key={tType._id} onClick={onSelect.bind(this, tType)}>
                    <td>
                      <label className={tType.provisioned ? 'checkbox state-disabled' : 'checkbox'}>
                        <input
                          type="checkbox"
                          name="selected"
                          checked={tType.selected}
                          value={false}
                          onChange={onSelect.bind(this, tType)}
                          disabled={tType.provisioned ? 'disabled' : ''}
                        />
                        <i />
                      </label>
                    </td>
                    <td>{tType.provisioned ? <s>{tType.name}</s> : tType.name}</td>
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
            <p>{` transaction ${numChoicesSelected === 1 ? 'type' : 'types'} selected`}</p>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default ProvisionTransactionType;
