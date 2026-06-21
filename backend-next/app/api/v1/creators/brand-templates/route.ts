import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { awardCredits } from '@/lib/creator-credits';

function serializeTemplate(row: {
  id: number;
  name: string;
  logoPath: string | null;
  watermarkText: string | null;
  footer: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    logo_path: row.logoPath,
    watermark_text: row.watermarkText,
    footer: row.footer,
    is_default: row.isDefault,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const items = await prisma.brandTemplate.findMany({
      where: { userId: auth.userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ items: items.map(serializeTemplate) });
  } catch (error) {
    console.error('List brand templates failed:', error);
    return NextResponse.json(
      { error: '获取品牌模板失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const name = (body.name as string)?.trim() || '默认模板';
    const isDefault = Boolean(body.is_default ?? body.isDefault);

    if (isDefault) {
      await prisma.brandTemplate.updateMany({
        where: { userId: auth.userId },
        data: { isDefault: false },
      });
    }

    const template = await prisma.brandTemplate.create({
      data: {
        userId: auth.userId,
        name,
        logoPath: body.logo_path ?? body.logoPath ?? null,
        watermarkText: body.watermark_text ?? body.watermarkText ?? null,
        footer: body.footer ?? null,
        isDefault,
      },
    });

    if (isDefault) {
      await awardCredits(auth.userId, 'apply_brand', {
        refType: 'brand_template',
        refId: String(template.id),
        note: `保存品牌模板「${name}」`,
      });
    }

    return NextResponse.json(serializeTemplate(template), { status: 201 });
  } catch (error) {
    console.error('Create brand template failed:', error);
    return NextResponse.json(
      { error: '创建品牌模板失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
