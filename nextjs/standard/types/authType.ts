// 登录请求参数
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

// 注册请求参数
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

// 用户信息
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 认证响应
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

// 刷新token请求
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 刷新token响应
export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// 重置密码请求
export interface ResetPasswordRequest {
  email: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API错误响应
export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// 认证状态
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 认证操作
export interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken?: string) => void;
  clearAuth: () => void;
}
