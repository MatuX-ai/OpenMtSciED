import prisma from '@/lib/db';

export interface CreateAttributionInput {
  userId: number;
  resourceType: string;
  resourceId: string;
  resourceTitle?: string;
  sourceUrl: string;
  license?: string;
  author?: string;
  retrievedAt?: Date;
}

export async function createResourceAttribution(input: CreateAttributionInput) {
  return prisma.resourceAttribution.create({
    data: {
      userId: input.userId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      resourceTitle: input.resourceTitle,
      sourceUrl: input.sourceUrl,
      license: input.license,
      author: input.author,
      retrievedAt: input.retrievedAt ?? new Date(),
    },
  });
}

export function serializeAttribution(row: {
  id: number;
  resourceType: string;
  resourceId: string;
  resourceTitle: string | null;
  sourceUrl: string;
  license: string | null;
  author: string | null;
  retrievedAt: Date;
  createdAt: Date;
}) {
  return {
    id: row.id,
    resource_type: row.resourceType,
    resource_id: row.resourceId,
    resource_title: row.resourceTitle,
    source_url: row.sourceUrl,
    license: row.license,
    author: row.author,
    retrieved_at: row.retrievedAt.toISOString(),
    created_at: row.createdAt.toISOString(),
  };
}
