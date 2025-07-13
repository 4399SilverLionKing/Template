import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 在实际应用中，这里可能需要：
    // 1. 将token加入黑名单
    // 2. 清除服务端session
    // 3. 记录登出日志等
    
    // 对于模拟API，我们只需要返回成功响应
    return NextResponse.json({ message: '登出成功' });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
