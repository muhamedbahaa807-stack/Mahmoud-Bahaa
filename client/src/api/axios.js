import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from './tokenService';

const api = axios.create({
  baseURL: 'http://localhost:3030',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/refresh')) {
      removeAccessToken();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await api.post('/refresh');

      setAccessToken(data.accessToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${data.accessToken}`,
      };
      return api(originalRequest);
    } catch (err) {
      removeAccessToken();

      return Promise.reject(err);
    }
  },
);

export default api;
