import type { LoginParams } from '../apis/authApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login } from '../apis/authApi'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const username = ref<string | null>(localStorage.getItem('username'))
  const isLoggedIn = ref(!!token.value)

  // 获取token的函数，用于API拦截器
  const getToken = () => token.value

  // 登录
  async function loginUser(params: LoginParams) {
    try {
      const response = await login(params)
      token.value = response.data.token
      username.value = response.data.username
      isLoggedIn.value = true

      // 保存到本地存储
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', response.data.username)

      return true
    }
    catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 登出
  function logout() {
    token.value = null
    username.value = null
    isLoggedIn.value = false

    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  return {
    token,
    username,
    isLoggedIn,
    loginUser,
    logout,
    getToken,
  }
})
