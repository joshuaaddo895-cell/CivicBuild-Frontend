import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { getApiBaseUrl, getApiTimeoutMs } from '@config/api';
import { useAuthStore } from '@store/authStore';
import { isMultipartBody } from '@utils/multipartUpload';

const AUTH_PATHS_WITHOUT_REFRESH = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/logout',
  '/api/auth/refresh',
];

function shouldSkipRefresh(url?: string): boolean {
  if (!url) {
    return false;
  }

  return AUTH_PATHS_WITHOUT_REFRESH.some((path) => url.includes(path));
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: getApiTimeoutMs(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isMultipartBody(config.data)) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken: storedRefreshToken, setTokens, logout } = useAuthStore.getState();

    if (!storedRefreshToken) {
      isRefreshing = false;
      await logout();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<{
        success: boolean;
        data: { accessToken: string; refreshToken: string };
      }>(
        `${getApiBaseUrl()}/api/auth/refresh`,
        { refreshToken: storedRefreshToken },
        {
          timeout: getApiTimeoutMs(),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('Token refresh failed.');
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      await setTokens(newAccessToken, newRefreshToken);
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
