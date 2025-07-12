import { useRouter } from 'next/navigation';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import authApi from '@/lib/apis/authApi';
import { useAuthStore } from '@/lib/stores/authStore';
import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/types/authType';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  validate: () => [...authKeys.all, 'validate'] as const,
};

/**
 * 登录 mutation
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: data => {
      // 登录成功后刷新相关查询
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      // 重定向到首页或之前的页面
      const redirectTo =
        new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectTo);
    },
    onError: error => {
      console.error('Login failed:', error);
    },
  });
};

/**
 * 注册 mutation
 */
export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: data => {
      // 注册成功后刷新相关查询
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      // 重定向到首页
      router.push('/');
    },
    onError: error => {
      console.error('Registration failed:', error);
    },
  });
};

/**
 * 登出 mutation
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // 清除所有查询缓存
      queryClient.clear();

      // 重定向到登录页
      router.push('/login');
    },
    onError: error => {
      console.error('Logout failed:', error);
      // 即使登出失败，也要重定向到登录页
      router.push('/login');
    },
  });
};

/**
 * 获取当前用户信息 query
 */
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated, // 只有在已认证时才执行查询
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    retry: (failureCount, error: any) => {
      // 如果是401错误，不重试
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * 重置密码 mutation
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: data => {
      console.log('Password reset email sent:', data.message);
    },
    onError: error => {
      console.error('Password reset failed:', error);
    },
  });
};

/**
 * 修改密码 mutation
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: data => {
      console.log('Password changed successfully:', data.message);
    },
    onError: error => {
      console.error('Password change failed:', error);
    },
  });
};

/**
 * 验证token query
 */
export const useValidateToken = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.validate(),
    queryFn: () => authApi.validateToken(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10分钟内不重新验证
    retry: false, // 不重试
  });
};

/**
 * 刷新token mutation
 */
export const useRefreshToken = () => {
  const { refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return authApi.refreshToken(refreshToken);
    },
    onError: error => {
      console.error('Token refresh failed:', error);
      // 刷新失败时清除认证状态
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
    },
  });
};

/**
 * 认证状态 hook
 */
export const useAuthState = () => {
  const authState = useAuthStore();

  return {
    ...authState,
    // 添加一些便捷的计算属性
    isLoggedIn: authState.isAuthenticated && !!authState.user,
    hasToken: !!authState.token,
  };
};
