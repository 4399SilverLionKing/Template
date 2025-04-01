import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/userStore'

// 定义响应数据的通用结构
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 定义分页数据的通用结构
export interface PageResponse<T> {
  pageIndex: number
  pageSize: number
  rows: T[]
}
// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从pinia的store中获取token
    // 注意：由于请求拦截器是在应用初始化时就设置的，
    // 直接初始化时调用useUserStore可能会有问题，
    // 因此每次请求时再获取store
    try {
      const userStore = useUserStore()
      const token = userStore.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    catch {
      // 如果pinia store尚未初始化，回退到localStorage获取token
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    ElMessage.error('请求发送失败，请检查网络连接')
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    // 这里可以根据后端返回的状态码进行不同的处理
    if (data.code && data.code !== 10000) {
      ElMessage.error(data.message || '请求失败，请稍后重试')
      return Promise.reject(new Error(data.message || '未知错误'))
    }

    return data
  },
  (error) => {
    // 处理JWT过期的错误
    if (error.response && error.response.status === 401) {
      // 尝试获取store清除用户信息
      try {
        const userStore = useUserStore()
        userStore.logout()
      }
      catch {
        // 如果store不可用，直接清除localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('username')
      }
      ElMessage.error('登录已过期，请重新登录')
    }
    else if (error.response && error.response.status === 403) {
      ElMessage.error('没有操作权限')
    }
    else if (error.response && error.response.status === 404) {
      ElMessage.error('请求的资源不存在')
    }
    else if (error.response && error.response.status === 500) {
      ElMessage.error('服务器错误，请联系管理员')
    }
    else if (error.message && error.message.includes('timeout')) {
      ElMessage.error('请求超时，请检查网络连接')
    }
    else {
      ElMessage.error('请求失败，请稍后重试')
    }
    // 添加1秒延迟后再跳转
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
    return Promise.reject(error)
  },
)

// 封装GET请求
export function get<T>(url: string, params?: any, config = {}): Promise<T> {
  return service.get(url, { params, ...config })
}

// 封装POST请求
export function post<T>(url: string, data?: any, config = {}): Promise<T> {
  return service.post(url, data, config)
}

// 封装PUT请求
export function put<T>(url: string, data?: any, config = {}): Promise<T> {
  return service.put(url, data, config)
}

// 封装DELETE请求
export function del<T>(url: string, config = {}): Promise<T> {
  return service.delete(url, config)
}

export default service
