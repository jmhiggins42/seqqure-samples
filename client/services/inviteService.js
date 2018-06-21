import axios from 'axios';

let baseUrl = process.env.REACT_APP_WEB_API_DOMAIN || '';
baseUrl += '/api/';

//////////////////////////////
// POST FUNCTIONS
//////////////////////////////

export const sendInvitation = invitation => {
  const url = baseUrl + 'invites/send';

  const config = {
    data: invitation,
    method: 'POST',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export const resendInvitation = id => {
  const url = baseUrl + 'invites/resend/' + id;

  const config = {
    method: 'PUT',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export const registerPerson = person => {
  const url = baseUrl + 'invites/register';

  const config = {
    data: person,
    method: 'POST',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

//////////////////////////////
// PUT FUNCTIONS
//////////////////////////////

export const checkInvitation = token => {
  const url = baseUrl + 'invites/check/' + token;

  const config = {
    method: 'PUT',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

//////////////////////////////
// CALLBACK FUNCTIONS
//////////////////////////////

const responseSuccessHandler = response => response.data;

const responseErrorHandler = error => Promise.reject(error);
