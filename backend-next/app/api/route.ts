import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    service: 'OpenMTSciEd',
    version: '2.0.0',
    message: 'STEM 连贯学习路径引擎 API',
    docs: '/api/health',
  });
}
