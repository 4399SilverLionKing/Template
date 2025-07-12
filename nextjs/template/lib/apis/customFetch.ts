// 请求拦截器类型定义
export interface RequestInterceptor {
  (config: RequestInit): RequestInit | Promise<RequestInit>;
}

// 响应拦截器类型定义
export interface ResponseInterceptor {
  onFulfilled?: (response: Response) => Response | Promise<Response>;
  onRejected?: (error: any) => any;
}

// 后端返回的数据结构
export interface BackendResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 响应数据接口
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// 状态码枚举
export enum ResponseCode {
  SUCCESS = 10000,
  FAIL = 9999,
  SERVER_BUSY = 9998,
  API_UN_IMPL = 9997,
  CONTENT_TYPE_ERR = 9996,
  PARAMS_INVALID = 9995,
  SERVER_ERROR = 9994,
  FORBIDDEN = 403,
  UNAUTHORIZED = 401,
}

// 自定义API错误类
export class ApiError extends Error {
  public readonly status: number;
  public readonly data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// 获取token的函数类型
export type TokenProvider = () => string | null | Promise<string | null>;

class CustomFetch {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private tokenProvider: TokenProvider | null = null;

  // 设置token提供者
  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // 应用请求拦截器
  private async applyRequestInterceptors(
    config: RequestInit
  ): Promise<RequestInit> {
    let finalConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    return finalConfig;
  }

  // 应用响应拦截器
  private async applyResponseInterceptors(
    response: Response
  ): Promise<Response> {
    let finalResponse = response;

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onFulfilled) {
        try {
          finalResponse = await interceptor.onFulfilled(finalResponse);
        } catch (error) {
          if (interceptor.onRejected) {
            throw await interceptor.onRejected(error);
          }
          throw error;
        }
      }
    }

    return finalResponse;
  }

  // 处理响应拦截器错误
  private async handleResponseError(error: any): Promise<never> {
    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onRejected) {
        throw await interceptor.onRejected(error);
      }
    }
    throw error;
  }

  // 添加Authorization头
  private async addAuthHeader(headers: HeadersInit = {}): Promise<HeadersInit> {
    if (!this.tokenProvider) return headers;

    const token = await this.tokenProvider();
    if (!token) return headers;

    const headersObj = new Headers(headers);
    headersObj.set('Authorization', `Bearer ${token}`);

    return headersObj;
  }

  // 解析响应数据
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let rawData: any;

    const contentType = response.headers.get('content-type');

    try {
      if (contentType && contentType.includes('application/json')) {
        rawData = await response.json();
      } else {
        rawData = await response.text();
      }
    } catch (error) {
      throw new ApiError(response.status, 'Failed to parse response', error);
    }

    // 检查是否是后端标准格式
    if (
      rawData &&
      typeof rawData === 'object' &&
      'code' in rawData &&
      'message' in rawData
    ) {
      const backendResponse = rawData as BackendResponse<T>;

      // 根据后端状态码判断是否成功
      if (backendResponse.code !== ResponseCode.SUCCESS) {
        throw new ApiError(
          response.status, // 使用原始HTTP状态码
          backendResponse.message,
          backendResponse
        );
      }

      return {
        data: backendResponse.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    }

    // 如果不是标准格式，直接返回原始数据
    return {
      data: rawData as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // 统一错误处理
  private handleError(response: Response, data: any): never {
    let message = 'Request failed';

    // 根据状态码提供更具体的错误信息
    switch (response.status) {
      case 400:
        message = 'Bad Request - 请求参数错误';
        break;
      case 401:
        message = 'Unauthorized - 未授权访问';
        break;
      case 403:
        message = 'Forbidden - 禁止访问';
        break;
      case 404:
        message = 'Not Found - 资源不存在';
        break;
      case 422:
        message = 'Unprocessable Entity - 请求参数验证失败';
        break;
      case 429:
        message = 'Too Many Requests - 请求过于频繁';
        break;
      case 500:
        message = 'Internal Server Error - 服务器内部错误';
        break;
      case 502:
        message = 'Bad Gateway - 网关错误';
        break;
      case 503:
        message = 'Service Unavailable - 服务不可用';
        break;
      default:
        message = `Request failed with status ${response.status}`;
    }

    // 如果响应数据中有错误信息，优先使用
    if (data && typeof data === 'object' && data.message) {
      message = data.message;
    }

    throw new ApiError(response.status, message, data);
  }

  // 主要的请求方法
  async request<T = any>(
    url: string,
    config: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 应用请求拦截器
      let finalConfig = await this.applyRequestInterceptors(config);

      // 设置默认headers
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...finalConfig.headers,
      };

      // 添加Authorization头
      headers = await this.addAuthHeader(headers);

      // 准备最终的fetch配置
      const fetchConfig: RequestInit = {
        ...finalConfig,
        headers,
      };

      // 发送请求
      let response = await fetch(url, fetchConfig);

      // 应用响应拦截器
      response = await this.applyResponseInterceptors(response);

      // 解析响应数据
      const parsedResponse = await this.parseResponse<T>(response);

      // 检查响应状态并进行错误处理
      if (!response.ok) {
        this.handleError(response, parsedResponse.data);
      }

      return parsedResponse;
    } catch (error) {
      // 应用响应错误拦截器
      return await this.handleResponseError(error);
    }
  }

  // 便捷方法
  async get<T = any>(
    url: string,
    config?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(
    url: string,
    config?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

// 创建默认实例
const customFetch = new CustomFetch();

// 设置token提供者
customFetch.setTokenProvider(() => {
  // 动态导入避免循环依赖
  if (typeof window !== 'undefined') {
    // 从 Zustand persist 存储中获取 token
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      } catch {
        return null;
      }
    }
  }
  return null;
});

// 设置默认的请求拦截器（添加通用headers等）
customFetch.addRequestInterceptor(config => {
  // 可以在这里添加通用的请求处理逻辑
  return config;
});

// 设置默认的响应拦截器
customFetch.addResponseInterceptor({
  onFulfilled: response => {
    // 可以在这里添加通用的响应处理逻辑
    return response;
  },
  onRejected: error => {
    // 只处理HTTP 401错误，自动登出
    if (error instanceof ApiError && error.status === 401) {
      // 动态导入避免循环依赖
      if (typeof window !== 'undefined') {
        const { useAuthStore } = require('@/lib/stores/authStore');
        const { clearAuth } = useAuthStore.getState();
        clearAuth();

        // 可以选择重定向到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    console.error('API Error:', error);
    return Promise.reject(error);
  },
});

export { CustomFetch, customFetch };
export default customFetch;
