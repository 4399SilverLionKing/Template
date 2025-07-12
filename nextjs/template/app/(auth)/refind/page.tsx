'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CheckCircle, Mail, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/useAuth';

export default function RefindPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证邮箱格式
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('邮箱格式不正确');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ email });
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error.message || '发送重置邮件失败，请稍后重试');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">邮件已发送</CardTitle>
          <CardDescription>我们已向您的邮箱发送了密码重置链接</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm">重置链接已发送至</p>
            <p className="font-medium">{email}</p>
          </div>
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>• 请检查您的邮箱（包括垃圾邮件文件夹）</p>
            <p>• 链接将在 24 小时后过期</p>
            <p>• 如果没有收到邮件，请检查邮箱地址是否正确</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={() => {
              setIsSubmitted(false);
              setEmail('');
            }}
            variant="outline"
            className="w-full"
          >
            重新发送邮件
          </Button>
          <div className="text-muted-foreground text-center text-sm">
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              返回登录页面
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          找回密码
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="请输入您注册时使用的邮箱"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`pl-10 ${error ? 'border-red-500' : ''}`}
                required
                disabled={resetPasswordMutation.isPending}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    i
                  </span>
                </div>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="mb-1 font-medium">重置密码说明：</p>
                <ul className="space-y-1 text-xs">
                  <li>• 我们将向您的邮箱发送安全的重置链接</li>
                  <li>• 链接有效期为 24 小时</li>
                  <li>• 点击链接后可设置新密码</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                发送中...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                发送重置链接
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground flex w-full justify-between space-y-2 text-center text-sm">
          <div>
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              想起密码了？
            </Link>
          </div>
          <div>
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              还没有账户？
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
