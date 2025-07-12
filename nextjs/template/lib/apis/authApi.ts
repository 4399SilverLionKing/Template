import { useAuthStore } from '@/lib/stores/authStore';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from '@/types/authType';

import customFetch from './customFetch';

// 认证API类
class AuthApi {
  private baseUrl = 'http://localhost:4444';

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await customFetch.post<AuthResponse>(
      `${this.baseUrl}/authenticate/login`,
      credentials
    );

    // 登录成功后更新store状态
    if (response.data.token) {
      const { setToken, setUser } = useAuthStore.getState();
      setToken(response.data.token, response.data.refreshToken);
      setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await customFetch.post<AuthResponse>(
      `${this.baseUrl}/authenticate/login`,
      data
    );

    // 注册成功后自动登录
    if (response.data.token) {
      const { setToken, setUser } = useAuthStore.getState();
      setToken(response.data.token, response.data.refreshToken);
      setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await customFetch.post('/api/auth/logout');
    } catch (error) {
      // 即使服务端登出失败，也要清除本地状态
      console.warn('Server logout failed:', error);
    } finally {
      // 清除本地认证状态
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
    }
  }

  /**
   * 刷新token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await customFetch.post<RefreshTokenResponse>(
      '/api/auth/refresh',
      { refreshToken } as RefreshTokenRequest
    );

    // 更新token
    if (response.data.token) {
      const { setToken } = useAuthStore.getState();
      setToken(response.data.token, response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await customFetch.get<User>('/api/auth/me');

    // 更新用户信息
    const { setUser } = useAuthStore.getState();
    setUser(response.data);

    return response.data;
  }

  /**
   * 重置密码
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    const response = await customFetch.post<{ message: string }>(
      '/api/auth/reset-password',
      data
    );

    return response.data;
  }

  /**
   * 修改密码
   */
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    const response = await customFetch.post<{ message: string }>(
      '/api/auth/change-password',
      data
    );

    return response.data;
  }

  /**
   * 验证token是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      await customFetch.get('/api/auth/validate');
      return true;
    } catch {
      return false;
    }
  }
}

// 创建API实例
const authApi = new AuthApi();

export default authApi;
export { AuthApi };
