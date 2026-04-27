import { NextResponse } from 'next/server';

/**
 * GET /api/v1/auth
 * API根路径 - 返回可用端点信息
 */
export async function GET() {
  return NextResponse.json({
    message: 'OpenMTSciEd Auth API',
    endpoints: {
      login: 'POST /api/v1/auth/login',
      register: 'POST /api/v1/auth/register',
      me: 'GET /api/v1/auth/me',
    },
  });
}
