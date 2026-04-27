import { NextResponse } from 'next/server';

/**
 * PUT /api/v1/questions/banks/[id]
 * 更新题库
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 在实际实现中，这里应该更新数据库或文件
    // 现在只是返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        id: parseInt(id),
        ...body,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error: unknown) {
    console.error('Update question bank error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/questions/banks/[id]
 * 删除题库
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 在实际实现中，这里应该从数据库或文件中删除
    // 现在只是返回成功响应
    return NextResponse.json({
      success: true,
      message: `题库 ${id} 已删除`
    });
  } catch (error: unknown) {
    console.error('Delete question bank error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
