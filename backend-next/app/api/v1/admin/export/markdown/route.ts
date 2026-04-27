import { NextResponse } from 'next/server';

interface ExportItem {
  title?: string;
  description?: string;
  estimated_hours?: number;
  [key: string]: unknown;
}

interface ExportRequest {
  title: string;
  content: ExportItem[];
  metadata?: Record<string, unknown>;
}

/**
 * 格式化内容为 Markdown
 */
function formatMarkdown(title: string, content: ExportItem[], metadata?: Record<string, unknown>): string {
  const mdLines: string[] = [`# ${title}\n`];
  
  if (metadata) {
    const generatedAt = metadata.generated_at || new Date().toLocaleString('zh-CN');
    mdLines.push(`**生成时间**: ${generatedAt}`);
    mdLines.push('---\n');
  }
  
  content.forEach((item, index) => {
    const itemTitle = item.title || `未命名模块 ${index + 1}`;
    mdLines.push(`## ${index + 1}. ${itemTitle}\n`);
    
    if (item.description) {
      mdLines.push(`${item.description}\n`);
    }
    
    if (item.estimated_hours !== undefined) {
      mdLines.push(`- **预计学时**: ${item.estimated_hours} 小时`);
    }
    
    mdLines.push('');
  });
  
  return mdLines.join('\n');
}

/**
 * POST /api/v1/admin/export/markdown
 * 导出为 Markdown 格式
 */
export async function POST(request: Request) {
  try {
    const body: ExportRequest = await request.json();
    
    const { title, content, metadata } = body;
    
    if (!title || !content || !Array.isArray(content)) {
      return NextResponse.json(
        { error: '请求参数无效', message: '需要提供 title 和 content 数组' },
        { status: 400 }
      );
    }
    
    const markdownContent = formatMarkdown(title, content, metadata);
    
    return NextResponse.json({
      success: true,
      data: {
        content: markdownContent,
        format: 'markdown',
      },
    });
  } catch (error: unknown) {
    console.error('Export markdown error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '服务器错误', 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
