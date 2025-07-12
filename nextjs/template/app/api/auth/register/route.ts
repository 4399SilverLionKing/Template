import { NextRequest, NextResponse } from 'next/server';

import type { AuthResponse, RegisterRequest } from '@/types/authType';

// 模拟用户数据库
let MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
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

// 生成新的用户ID
function generateUserId(): string {
  return (MOCK_USERS.length + 1).toString();
}

// 验证邮箱格式
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证密码强度
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, confirmPassword, name } = body;

    // 验证输入
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: '邮箱、密码和确认密码不能为空' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: '姓名不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { message: '密码至少需要8位字符' },
        { status: 400 }
      );
    }

    // 验证密码确认
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: '密码和确认密码不匹配' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 创建新用户
    const newUserId = generateUserId();
    const newUser = {
      id: newUserId,
      email: email.toLowerCase(),
      password, // 在实际应用中，这应该是哈希密码
      name: name.trim(),
      role: 'user',
    };

    // 添加到模拟数据库
    MOCK_USERS.push(newUser);

    // 生成tokens
    const token = generateToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // 构造响应数据
    const authResponse: AuthResponse = {
      token,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      expiresIn: 24 * 60 * 60, // 24小时
    };

    return NextResponse.json(authResponse, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
