'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  difficulty_level: string;
}

interface HardwareProject {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  category: string;
  subject: string;
  estimated_time_hours: number;
}

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tutorials' | 'hardware' | 'api'>('overview');
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [hardwareProjects, setHardwareProjects] = useState<HardwareProject[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTutorials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/tutorials?page=1&size=10');
      const data = await res.json();
      setTutorials(data.items || []);
    } catch (error) {
      console.error('Failed to load tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHardwareProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/hardware-projects?page=1&size=10');
      const data = await res.json();
      setHardwareProjects(data.items || []);
    } catch (error) {
      console.error('Failed to load hardware projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tutorials') {
      loadTutorials();
    } else if (activeTab === 'hardware') {
      loadHardwareProjects();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Home Link */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <span className="text-2xl">🚀</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">OpenMTSciEd</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  首页
                </Link>
                <Link href="/developer" className="text-blue-600 dark:text-blue-400 font-medium">
                  开发者门户
                </Link>
                <a href="https://github.com/openmtscied" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  GitHub
                </a>
              </div>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                API v1.0
              </span>
              <a
                href="/api/health"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                API测试
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Developer Portal
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              STEM教育资源开放平台
            </p>
            <p className="text-lg opacity-80 max-w-3xl mx-auto">
              为开发者提供高质量的教程、课件和硬件项目API，助力STEM教育创新
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#quick-start"
                onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg"
              >
                🚀 快速开始
              </a>
              <a
                href="#api-docs"
                onClick={(e) => { e.preventDefault(); setActiveTab('api'); }}
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
              >
                📖 API文档
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                OpenMTSciEd Developer Portal
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                STEM教育资源开放平台 - 为开发者提供教程、课件和硬件项目API
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                API v1.0
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Open Source
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: '概览', icon: '🏠' },
              { id: 'tutorials', label: '教程资源', icon: '📚' },
              { id: 'hardware', label: '硬件项目', icon: '🔧' },
              { id: 'api', label: 'API文档', icon: '⚡' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                欢迎使用 OpenMTSciEd 开发者平台
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                OpenMTSciEd 是一个开放的STEM教育资源平台,提供高质量的科学、技术、工程和数学教育资源。
                通过我们的API,您可以轻松集成教程、课件和硬件项目到您的应用中。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">教程资源</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    涵盖物理、化学、数学等学科的完整教程
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <div className="text-3xl mb-2">🎓</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">互动课件</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    PDF、视频和交互式学习材料
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <div className="text-3xl mb-2">🔧</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">硬件项目</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Arduino、机器人等实践项目
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 快速开始
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 安装SDK</h3>
                  <code className="text-sm text-gray-700 dark:text-gray-300 block bg-gray-100 dark:bg-gray-800 p-3 rounded">
                    npm install @openmtscied/sdk
                  </code>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 初始化客户端</h3>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 block bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`import { OpenMTClient } from '@openmtscied/sdk';

const client = new OpenMTClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000/api/v1'
});`}
                  </pre>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 获取教程</h3>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 block bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`const tutorials = await client.tutorials.list({
  subject: 'physics',
  gradeLevel: '9-12',
  page: 1,
  size: 10
});

console.log(tutorials.items);`}
                  </pre>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <a
                  href="#api"
                  onClick={(e) => { e.preventDefault(); setActiveTab('api'); }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  查看完整API文档
                </a>
                <a
                  href="https://github.com/openmtscied"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  GitHub仓库
                </a>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  ✨ 核心特性
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>RESTful API设计,易于集成</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>完整的TypeScript类型定义</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>知识图谱驱动的智能推荐</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>个性化学习路径生成</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>开源免费,社区驱动</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📊 平台数据
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-gray-700 dark:text-gray-300">知识点</span>
                    <span className="text-2xl font-bold text-blue-600">4,623</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-gray-700 dark:text-gray-300">课程单元</span>
                    <span className="text-2xl font-bold text-green-600">2,225</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <span className="text-gray-700 dark:text-gray-300">硬件项目</span>
                    <span className="text-2xl font-bold text-purple-600">14</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <span className="text-gray-700 dark:text-gray-300">学科覆盖</span>
                    <span className="text-2xl font-bold text-orange-600">15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === 'tutorials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📚 教程资源
              </h2>
              <button
                onClick={loadTutorials}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                刷新
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tutorial.title}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {tutorial.subject}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{tutorial.grade_level}</span>
                      <span>{tutorial.duration_minutes}分钟</span>
                      <span className="capitalize">{tutorial.difficulty_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tutorials.length === 0 && !loading && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">
                  暂无教程数据。请先在Neo4j中创建Tutorial节点。
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hardware Projects Tab */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔧 硬件项目
              </h2>
              <button
                onClick={loadHardwareProjects}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                刷新
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hardwareProjects.map((project) => (
                  <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">难度:</span>
                        <span className="capitalize text-gray-700 dark:text-gray-300">{project.difficulty_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">预计时间:</span>
                        <span className="text-gray-700 dark:text-gray-300">{project.estimated_time_hours}小时</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">学科:</span>
                        <span className="text-gray-700 dark:text-gray-300">{project.subject}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hardwareProjects.length === 0 && !loading && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">
                  暂无硬件项目数据。
                </p>
              </div>
            )}
          </div>
        )}

        {/* API Documentation Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ⚡ API文档
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                基础信息
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p><strong>Base URL:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">http://localhost:3000/api/v1</code></p>
                <p><strong>认证方式:</strong> 目前无需认证(开发环境)</p>
                <p><strong>响应格式:</strong> JSON</p>
                <p><strong>字符编码:</strong> UTF-8</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                主要端点
              </h3>
              
              <div className="space-y-6">
                {/* Tutorials API */}
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">教程管理</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-green-600">GET</span> /tutorials?page=1&size=20&subject=physics
                      </code>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">POST</span> /tutorials
                      </code>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-green-600">GET</span> /tutorials/:id
                      </code>
                    </div>
                  </div>
                </div>

                {/* Knowledge Graph API */}
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">知识图谱</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">POST</span> /knowledge-graph/path
                      </code>
                      <p className="text-xs text-gray-500 mt-1">生成学习路径</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">POST</span> /knowledge-graph/recommend
                      </code>
                      <p className="text-xs text-gray-500 mt-1">获取资源推荐</p>
                    </div>
                  </div>
                </div>

                {/* Hardware Projects API */}
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">硬件项目</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-green-600">GET</span> /hardware-projects?page=1&size=20
                      </code>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">POST</span> /hardware-projects
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📖 完整文档
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                查看完整的API文档、示例代码和最佳实践指南。
              </p>
              <div className="flex space-x-4">
                <a
                  href="/api-docs"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  在线文档
                </a>
                <a
                  href="https://github.com/openmtscied/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  GitHub文档
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>OpenMTSciEd - 开放STEM教育资源平台</p>
            <p className="mt-2 text-sm">
              Built with Next.js, Neo4j, and ❤️ for educators and developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
