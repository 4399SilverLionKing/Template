import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthActions, AuthState, User } from '@/types/authType';

// 认证store类型
type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // 设置token
      setToken: (token: string, refreshToken?: string) => {
        set({
          token,
          refreshToken: refreshToken || get().refreshToken,
          isAuthenticated: true,
        });
      },

      // 设置用户信息
      setUser: (user: User) => {
        set({ user });
      },

      // 清除认证信息（登出）
      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      // 只持久化必要的状态，不持久化isLoading
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
