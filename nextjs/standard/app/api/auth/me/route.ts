import { NextRequest, NextResponse } from 'next/server';

import type { User } from '@/types/authType';

// 模拟用户数据库
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    name: '管理员',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    name: '普通用户',
    role: 'user',
  },
];

// 解析token获取用户ID（简化版本）
function parseToken(token: string): { userId: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // 检查token是否过期
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未提供认证token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀
    const tokenData = parseToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { message: 'token无效或已过期' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = MOCK_USERS.find(u => u.id === tokenData.userId);
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 构造用户响应数据
    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
