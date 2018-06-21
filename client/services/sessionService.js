import axios from 'axios';

let baseUrl = process.env.REACT_APP_WEB_API_DOMAIN || '';
baseUrl += '/api/session';

//////////////////////////////
// GET FUNCTIONS
//////////////////////////////

export const getSession = () => {
  const config = {
    method: 'GET',
    withCredentials: true
  };

  return axios(baseUrl, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

//////////////////////////////
// CALLBACK FUNCTIONS
//////////////////////////////

const responseSuccessHandler = response => response.data;

const responseErrorHandler = error => Promise.reject(error);
