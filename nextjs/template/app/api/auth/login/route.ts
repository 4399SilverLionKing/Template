import { NextRequest, NextResponse } from 'next/server';

import type { AuthResponse, LoginRequest } from '@/types/authType';

// 模拟用户数据库
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', // 在实际应用中，这应该是哈希密码
    name: '管理员',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: '普通用户',
    role: 'user',
  },
];

// 生成简单的JWT token（实际应用中应使用真正的JWT库）
function generateToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24小时过期
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 生成refresh token
function generateRefreshToken(userId: string): string {
  const payload = {
    userId,
    type: 'refresh',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天过期
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, remember } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { message: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 401 }
      );
    }

    // 验证密码
    if (user.password !== password) {
      return NextResponse.json(
        { message: '密码错误' },
        { status: 401 }
      );
    }

    // 生成tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // 构造响应数据
    const authResponse: AuthResponse = {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      expiresIn: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 记住我：30天，否则24小时
    };

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
