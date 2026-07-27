import axios, { AxiosRequestConfig } from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface IApiRequestParams<P = any, Q = any, B = any> {
  pathVars?: P;
  params?: Q;
  body?: B;
  headers?: Record<string, string>;
}

export interface IApiServiceOptions extends AxiosRequestConfig {
  pathVars?: any;
  body?: any;
}

export async function apiService<R = any>(options: IApiServiceOptions): Promise<R> {
  let { url, method = 'GET', pathVars, params, body, headers } = options;

  if (url && pathVars) {
    Object.keys(pathVars).forEach((key) => {
      url = url!.replace(`:${key}`, String(pathVars[key]));
    });
  }

  const response = await axiosClient.request({
    url,
    method,
    params,
    data: body,
    headers,
  });

  return response.data;
}
