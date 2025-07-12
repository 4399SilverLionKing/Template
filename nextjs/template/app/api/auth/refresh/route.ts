import { NextRequest, NextResponse } from 'next/server';

import type { RefreshTokenRequest, RefreshTokenResponse } from '@/types/authType';

// 生成模拟JWT token
function generateMockToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时后过期
  }));
  const signature = btoa(`mock-signature-${userId}`);
  
  return `${header}.${payload}.${signature}`;
}

// 生成刷新token
function generateRefreshToken(userId: string): string {
  const payload = btoa(JSON.stringify({
    sub: userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天后过期
  }));
  
  return `refresh.${payload}.${btoa(`mock-refresh-signature-${userId}`)}`;
}

// 解析刷新token
function parseRefreshToken(token: string): { sub: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'refresh') return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // 检查是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    // 检查是否是刷新token
    if (payload.type !== 'refresh') {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshTokenRequest = await request.json();
    
    // 验证请求数据
    if (!body.refreshToken) {
      return NextResponse.json(
        { error: '刷新token不能为空' },
        { status: 400 }
      );
    }

    // 解析刷新token
    const payload = parseRefreshToken(body.refreshToken);
    
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: '刷新token无效或已过期' },
        { status: 401 }
      );
    }

    // 生成新的tokens
    const newToken = generateMockToken(payload.sub);
    const newRefreshToken = generateRefreshToken(payload.sub);

    // 构造响应数据
    const response: RefreshTokenResponse = {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 24 * 60 * 60, // 24小时
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
