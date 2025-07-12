import Link from 'next/link';

import {
  Code,
  Database,
  Globe,
  Layers,
  Palette,
  Rocket,
  Settings,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Home() {
  const features = [
    {
      icon: <Rocket className="h-6 w-6" />,
      title: 'Next.js 15',
      description:
        '最新版本的 React 框架，支持 App Router 和 Server Components',
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: 'shadcn/ui',
      description: '现代化的 UI 组件库，基于 Radix UI 和 Tailwind CSS',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Zustand',
      description: '轻量级的状态管理库，简单易用的全局状态解决方案',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'TanStack Query',
      description: '强大的数据获取和缓存库，包含开发者工具',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lucide React',
      description: '美观的图标库，提供丰富的 SVG 图标组件',
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'TypeScript',
      description: '类型安全的 JavaScript，提供更好的开发体验',
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: 'Tailwind CSS',
      description: '实用优先的 CSS 框架，快速构建现代化界面',
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: 'Custom API Wrapper',
      description: '自定义的 API 请求封装，支持拦截器和错误处理',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold text-slate-900 dark:text-slate-100">
            Next.js Template
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-slate-600 dark:text-slate-400">
            一个现代化的 Next.js 项目模板，集成了最佳实践和流行的开发工具，
            帮助你快速启动新项目。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">注册</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/refind">找回密码</Link>
            </Button>
          </div>
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看源码
              </a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-4 flex items-center">
                <div className="mr-3 rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
            技术栈
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div className="p-4">
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                React 19
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                前端框架
              </div>
            </div>
            <div className="p-4">
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Next.js 15
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                全栈框架
              </div>
            </div>
            <div className="p-4">
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                TypeScript
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                类型安全
              </div>
            </div>
            <div className="p-4">
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tailwind CSS
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                样式框架
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            使用现代化的工具和最佳实践构建 • 开箱即用
          </p>
        </div>
      </div>
    </div>
  );
}
