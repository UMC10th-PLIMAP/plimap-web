import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import type { ApiResponse } from '@/api/types';
import { API_BASE_URL } from '@/config/api';

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

// HTTP 코드가 401/403인지 판별하는 헬퍼 함수 (로그인 상태 확인 시 사용)
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export const SESSION_EXPIRED_EVENT = 'plimap:session-expired';
export const ACCOUNT_SANCTIONED_EVENT = 'plimap:account-sanctioned';
const ACCOUNT_SANCTION_ERROR_CODES = new Set(['MEMBER_SUSPENDED', 'MEMBER_WITHDRAWN']);

export type ApiRequestConfig = AxiosRequestConfig & {
  skipSessionExpiredEvent?: boolean;
};

const INTERNAL_AUTH_REQUEST_CONFIG: ApiRequestConfig = {
  // The original request decides whether a failed refresh represents an expired session.
  skipSessionExpiredEvent: true,
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function isApiRequestCanceled(error: unknown) {
  return axios.isCancel(error);
}

const CSRF_TOKEN_URL = '/api/v1/auth/csrf';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const CSRF_PROTECTED_METHODS = new Set(['post', 'put', 'patch', 'delete']);
const REISSUE_URL = '/api/v1/auth/reissue';

let csrfTokenRequest: Promise<string> | null = null;

function fetchCsrfToken() {
  if (!csrfTokenRequest) {
    csrfTokenRequest = apiClient
      .get<ApiResponse<{ token: string }>>(CSRF_TOKEN_URL)
      .then(({ data }) => data.result.token)
      .catch((error: unknown) => {
        csrfTokenRequest = null;
        throw error;
      });
  }
  return csrfTokenRequest;
}

// CSRF 토큰 처리를 위한 인터셉터
apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (method && CSRF_PROTECTED_METHODS.has(method)) {
    config.headers.set(CSRF_HEADER_NAME, await fetchCsrfToken());
    csrfTokenRequest = null;
  }
  return config;
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retriedAfterReissue?: boolean;
  skipSessionExpiredEvent?: boolean;
};

let reissueRequest: Promise<void> | null = null;

function reissueTokens() {
  if (!reissueRequest) {
    reissueRequest = apiClient
      .post(REISSUE_URL, undefined, INTERNAL_AUTH_REQUEST_CONFIG)
      .then(() => undefined)
      .finally(() => {
        reissueRequest = null;
      });
  }
  return reissueRequest;
}

// 에러 처리를 위한 인터셉터(토큰 재발급&에러 응답)
apiClient.interceptors.response.use(undefined, async (error: AxiosError<ApiResponse<unknown>>) => {
  // 토큰 재발급을 위한 로직
  const config = error.config as RetriableRequestConfig | undefined;

  const isReissueRequest = config?.url === REISSUE_URL;
  const isTokenError = error.response?.status === 401 || error.response?.status === 403;

  if (isTokenError && config && !isReissueRequest && !config._retriedAfterReissue) {
    config._retriedAfterReissue = true;

    try {
      await reissueTokens();
      return apiClient(config);
    } catch {
      // 토큰 재발급 실패 시 원래 에러를 아래 로직에서 처리
    }
  }

  // 에러 응답을 위한 로직
  if (
    error.response?.status === 401 &&
    !config?.skipSessionExpiredEvent &&
    typeof window !== 'undefined'
  ) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  if (error.response?.data?.code) {
    const { data, status } = error.response;
    if (typeof window !== 'undefined' && ACCOUNT_SANCTION_ERROR_CODES.has(data.code)) {
      window.dispatchEvent(new Event(ACCOUNT_SANCTIONED_EVENT));
    }
    return Promise.reject(new ApiError(data.code, data.message, status));
  }
  return Promise.reject(error);
});
