import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    service: 'OpenMTSciEd API',
    version: '2.0.0',
    description: 'STEM教育资源开放平台 - 纯API服务',
    endpoints: {
      health: '/api/health',
      tutorials: '/api/v1/tutorials',
      hardware: '/api/v1/hardware-projects',
      coursewares: '/api/v1/coursewares',
      knowledgeGraph: '/api/v1/knowledge-graph/path',
    },
    documentation: 'https://github.com/MatuX-ai/OpenMtSciED',
    website: 'https://opensciedu.vercel.app',
    message: '这是一个纯API服务,请使用/api/*路径访问接口',
  });
}
