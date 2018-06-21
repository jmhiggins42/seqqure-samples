import axios from 'axios';

let baseUrl = process.env.REACT_APP_WEB_API_DOMAIN || '';
baseUrl += '/api/';

//////////////////////////////
// POST FUNCTIONS
//////////////////////////////

export const checkEmail = email => {
  const url = baseUrl + 'users/email';

  const config = {
    data: email,
    method: 'POST',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export const loginUser = user => {
  const url = baseUrl + 'users/login';

  const config = {
    data: user,
    method: 'POST',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

//////////////////////////////
// GET FUNCTIONS
//////////////////////////////

export const checkLogin = () => {
  const url = baseUrl + 'users/check';

  const config = {
    method: 'GET',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export const logoutUser = () => {
  const url = baseUrl + 'users/logout';

  const config = {
    method: 'GET',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export const forgotPasswordReset = token => {
  const url = baseUrl + 'users/forgotPassword/' + token;

  const config = {
    method: 'GET',
    withCredentials: true
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

//////////////////////////////
// PUT FUNCTIONS
//////////////////////////////
export const forgotPassword = data => {
  const url = baseUrl + 'users/forgotPassword';

  const config = {
    method: 'PUT',
    withCredentials: true,
    data: data
  };

  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export const changePassword = data => {
  const url = baseUrl + 'usersLoggedIn/changePassword';
  const config = {
    data: data,
    method: 'PUT',
    withCredentials: true
  };
  return axios(url, config)
    .then(responseSuccessHandler)
    .catch(responseErrorHandler);
};

export const resetPassword = ({ password, token }) => {
  const url = baseUrl + 'users/resetPassword/' + token;
  const config = {
    data: { password },
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
