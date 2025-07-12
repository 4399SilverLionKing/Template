import { NextRequest, NextResponse } from 'next/server';

import type { ResetPasswordRequest } from '@/types/authType';

// 模拟用户数据库
const MOCK_USERS = [
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

// 验证邮箱格式
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 模拟发送重置密码邮件
function sendResetPasswordEmail(email: string, resetToken: string): void {
  // 在实际应用中，这里会调用邮件服务发送重置链接
  console.log(`发送重置密码邮件到: ${email}`);
  console.log(`重置令牌: ${resetToken}`);
  console.log(`重置链接: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);
}

// 生成重置密码令牌
function generateResetToken(userId: string): string {
  const payload = {
    userId,
    type: 'reset',
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24小时过期
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { email } = body;

    // 验证输入
    if (!email) {
      return NextResponse.json(
        { message: '邮箱不能为空' },
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

    // 查找用户
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // 为了安全考虑，无论用户是否存在都返回成功消息
    // 这样可以防止邮箱枚举攻击
    if (user) {
      // 生成重置令牌
      const resetToken = generateResetToken(user.id);
      
      // 发送重置密码邮件
      sendResetPasswordEmail(email, resetToken);
      
      // 在实际应用中，应该将重置令牌存储到数据库中
      // 这里我们只是模拟
      console.log(`为用户 ${user.id} 生成重置令牌: ${resetToken}`);
    } else {
      // 即使用户不存在，也要模拟发送邮件的时间
      console.log(`用户不存在: ${email}，但仍返回成功消息`);
    }

    return NextResponse.json({
      message: '如果该邮箱已注册，您将收到密码重置链接'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
