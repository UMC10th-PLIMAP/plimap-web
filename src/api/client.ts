import axios, { AxiosError } from 'axios';

import type { ApiResponse } from '@/api/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is missing in environment variables');
}

export class ApiError extends Error {
  // 백엔드 자체 오류 코드
  readonly code: string;
  // 실제 HTTP 상태 코드
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(undefined, (error: AxiosError<ApiResponse<unknown>>) => {
  if (error.response?.data?.code) {
    const { data, status } = error.response;
    return Promise.reject(new ApiError(data.code, data.message, status));
  }
  return Promise.reject(error);
});
