'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">OpenMTSciEd</span>
            </div>
            
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-blue-600 dark:text-blue-400 font-medium">
                首页
              </Link>
              <Link href="/developer" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                开发者门户
              </Link>
              <a href="https://github.com/openmtscied" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                GitHub
              </a>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                API v1.0
              </span>
              <Link
                href="/developer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                开发者入口
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            OpenMTSciEd
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            开放STEM教育资源平台
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Open Science & Technology Education Resources
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">教程资源</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              物理、化学、数学等学科的完整教程
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">知识图谱</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              智能学习路径和个性化推荐
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🔧</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">硬件项目</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Arduino、机器人等实践项目
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/developer"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-white font-medium transition-colors hover:bg-blue-700 shadow-lg"
          >
            <span className="text-xl">🚀</span>
            开发者门户
          </a>
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 px-8 text-gray-700 dark:text-gray-300 font-medium transition-colors hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            <span className="text-xl">⚡</span>
            API测试
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">4,623</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">知识点</div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">2,225</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">课程单元</div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">14</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">硬件项目</div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">15</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">学科覆盖</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t pt-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <a href="/developer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            开发者文档
          </a>
          <a href="https://github.com/openmtscied" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            GitHub
          </a>
          <a href="/api/v1/tutorials?page=1&size=1" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            API示例
          </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
