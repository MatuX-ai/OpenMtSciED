import { NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

/**
 * DELETE /api/v1/resources/associations/[id]
 * 代理到 Python 后端删除资源关联
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/resources/associations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Python backend error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy associations DELETE error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
