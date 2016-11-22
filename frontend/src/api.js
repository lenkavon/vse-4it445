import axios, { CancelToken } from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

export function getCancelTokenSource() {
  return CancelToken.source();
}

export function setAuthToken(authToken) {
  api.defaults.headers.common['Authorization'] = authToken;
}

export default api;
