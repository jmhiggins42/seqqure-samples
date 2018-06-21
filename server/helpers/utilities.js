// printName: combines multiple name fields into one string
const printName = name => {
  const first = name.fName;
  const middle = name.mName ? ` ${name.mName} ` : ' ';
  const last = name.lName;
  const prefix = name.pName ? `${name.pName} ` : '';
  const suffix = name.sName ? `, ${name.sName}` : '';

  return `${prefix}${first}${middle}${last}${suffix}`;
};

// printAddress: combines multiple address fields into one string
const printAddress = address => {
  const suite = address.suite ? `, #${address.suite.replace(/(Suite|Ste\.?|#) ?/g, '')}` : '';

  return `${address.street}${suite}, ${address.city}, ${address.state} ${address.zip}`;
};

// Useful for company names w/ Corp., Inc., etc.
const trimTrailingPeriod = str => str.replace(/\.+$/, '');

module.exports = {
  printName,
  printAddress,
  trimTrailingPeriod
};
