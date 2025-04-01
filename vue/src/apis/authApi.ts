import type { ApiResponse } from './http'
import { post } from './http'

export interface LoginParams {
  userName: string
  userPassword: string
}

export interface LoginResponse {
  token: string
  username: string
}

/**
 * 用户登录
 */
export function login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
  return post<ApiResponse<LoginResponse>>('/authenticate/login', params)
}
