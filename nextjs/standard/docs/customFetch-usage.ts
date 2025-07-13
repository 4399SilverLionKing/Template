// 使用示例文件 - 展示如何使用封装的fetch请求
import customFetch, { ApiError, CustomFetch } from '../lib/apis/customFetch';

// 1. 基本使用示例
export async function basicUsageExample() {
  try {
    // GET请求
    const response = await customFetch.get<{ id: number; name: string }>(
      '/api/users/1'
    );
    console.log('User data:', response.data);

    // POST请求
    const createResponse = await customFetch.post<{ id: number }>(
      '/api/users',
      {
        name: 'John Doe',
        email: 'john@example.com',
      }
    );
    console.log('Created user ID:', createResponse.data.id);

    // PUT请求
    await customFetch.put('/api/users/1', {
      name: 'Jane Doe',
      email: 'jane@example.com',
    });

    // DELETE请求
    await customFetch.delete('/api/users/1');
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message, 'Status:', error.status);
      console.error('Error data:', error.data);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// 2. 设置token提供者示例
export function setupTokenProvider() {
  // 从localStorage获取token
  customFetch.setTokenProvider(() => {
    return localStorage.getItem('authToken');
  });

  // 或者从异步函数获取token
  customFetch.setTokenProvider(async () => {
    try {
      // 例如从某个API刷新token
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      return data.token;
    } catch {
      return null;
    }
  });
}

// 3. 添加自定义请求拦截器示例
export function setupRequestInterceptors() {
  // 添加请求ID用于追踪
  customFetch.addRequestInterceptor(config => {
    const requestId = Math.random().toString(36).substr(2, 9);
    const headers = new Headers(config.headers);
    headers.set('X-Request-ID', requestId);

    return {
      ...config,
      headers,
    };
  });

  // 添加时间戳
  customFetch.addRequestInterceptor(config => {
    const headers = new Headers(config.headers);
    headers.set('X-Timestamp', Date.now().toString());

    return {
      ...config,
      headers,
    };
  });
}

// 4. 添加自定义响应拦截器示例
export function setupResponseInterceptors() {
  // 添加响应时间记录
  customFetch.addResponseInterceptor({
    onFulfilled: response => {
      const requestId = response.headers.get('X-Request-ID');
      console.log(`Request ${requestId} completed in ${Date.now()}ms`);
      return response;
    },
    onRejected: error => {
      // 统一错误日志记录
      console.error('Request failed:', {
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });

      // 特殊错误处理
      if (error.status === 401) {
        // 清除本地token
        localStorage.removeItem('authToken');
        // 重定向到登录页
        window.location.href = '/login';
      }

      return Promise.reject(error);
    },
  });
}

// 5. 创建专用API实例示例
export function createSpecializedApiInstance() {
  // 创建专门用于用户API的实例
  const userApi = new CustomFetch();

  // 设置专用的token提供者
  userApi.setTokenProvider(() => localStorage.getItem('userApiToken'));

  // 添加专用的请求拦截器
  userApi.addRequestInterceptor(config => {
    const headers = new Headers(config.headers);
    headers.set('X-API-Version', '1.0');
    return { ...config, headers };
  });

  return userApi;
}

// 6. 高级使用示例
export async function advancedUsageExample() {
  try {
    // 普通的GET请求
    const response = await customFetch.get('/api/data');
    console.log('Data received:', response.data);

    // 普通的POST请求
    await customFetch.post('/api/long-operation', { data: 'test' });

    // 使用完整URL
    await customFetch.get('https://different-api.com/v2/users');
  } catch (error) {
    console.error('Advanced usage error:', error);
  }
}

// 7. 文件上传示例
export async function fileUploadExample(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // 对于文件上传，我们需要移除默认的Content-Type头
    const response = await customFetch.request<{ fileId: string }>(
      '/api/upload',
      {
        method: 'POST',
        body: formData,
        headers: {
          // 不设置Content-Type，让浏览器自动设置multipart/form-data
        },
      }
    );

    console.log('File uploaded:', response.data.fileId);
  } catch (error) {
    console.error('File upload failed:', error);
  }
}

// 8. 批量请求示例
export async function batchRequestExample() {
  try {
    // 并行发送多个请求
    const [users, posts, comments] = await Promise.all([
      customFetch.get<any[]>('/api/users'),
      customFetch.get<any[]>('/api/posts'),
      customFetch.get<any[]>('/api/comments'),
    ]);

    console.log('Batch results:', {
      usersCount: users.data.length,
      postsCount: posts.data.length,
      commentsCount: comments.data.length,
    });
  } catch (error) {
    console.error('Batch request failed:', error);
  }
}

// 9. 重试机制示例（可以通过拦截器实现）
export function setupRetryMechanism() {
  customFetch.addResponseInterceptor({
    onRejected: async error => {
      // 只对网络错误或5xx错误进行重试
      if (error.status >= 500 || error.message.includes('timeout')) {
        const maxRetries = 3;
        const retryDelay = 1000; // 1秒

        for (let i = 0; i < maxRetries; i++) {
          try {
            await new Promise(resolve =>
              setTimeout(resolve, retryDelay * (i + 1))
            );
            // 这里需要重新发送原始请求，实际实现会更复杂
            console.log(`Retrying request (attempt ${i + 1}/${maxRetries})`);
            // 返回重试结果...
            break;
          } catch (retryError) {
            if (i === maxRetries - 1) {
              throw retryError;
            }
          }
        }
      }

      throw error;
    },
  });
}

// 10. 初始化函数 - 在应用启动时调用
export function initializeApi() {
  setupTokenProvider();
  setupRequestInterceptors();
  setupResponseInterceptors();

  console.log('Custom fetch API initialized');
}
