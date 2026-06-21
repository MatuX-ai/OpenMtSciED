import prisma from '@/lib/db';
import { createConcept, updateConcept } from '@/lib/concept-path';
import { awardCredits } from '@/lib/creator-credits';

export interface LinkTutorialInput {
  userId: number;
  localTutorialId: number;
  tutorialTitle: string;
  subject?: string;
  description?: string;
  conceptId?: number;
}

export async function linkTutorialToGraph(input: LinkTutorialInput) {
  const legacyId = `tutorial-${input.localTutorialId}`;

  let conceptId = input.conceptId;
  if (conceptId) {
    const existing = await prisma.concept.findUnique({ where: { id: conceptId } });
    if (!existing) {
      throw new Error(`知识点不存在: ${conceptId}`);
    }
  } else {
    const byLegacy = await prisma.concept.findUnique({ where: { legacyNeo4jId: legacyId } });
    if (byLegacy) {
      conceptId = byLegacy.id;
      if (input.description && !byLegacy.description) {
        await updateConcept(conceptId, { description: input.description });
      }
    } else {
      const byName = await prisma.concept.findFirst({
        where: { name: { equals: input.tutorialTitle, mode: 'insensitive' } },
      });
      if (byName) {
        conceptId = byName.id;
      } else {
        const created = await createConcept({
          name: input.tutorialTitle,
          description: input.description || input.subject || undefined,
          legacyNeo4jId: legacyId,
        });
        conceptId = created.id;
      }
    }
  }

  const link = await prisma.conceptTutorialLink.upsert({
    where: {
      userId_localTutorialId: {
        userId: input.userId,
        localTutorialId: input.localTutorialId,
      },
    },
    create: {
      userId: input.userId,
      conceptId,
      localTutorialId: input.localTutorialId,
      tutorialTitle: input.tutorialTitle,
      subject: input.subject,
    },
    update: {
      conceptId,
      tutorialTitle: input.tutorialTitle,
      subject: input.subject,
    },
  });

  const saveCredit = await awardCredits(input.userId, 'save_tutorial', {
    refType: 'tutorial',
    refId: String(input.localTutorialId),
    note: `保存教程「${input.tutorialTitle}」`,
  });

  const graphCredit = await awardCredits(input.userId, 'link_graph', {
    refType: 'concept',
    refId: String(conceptId),
    note: `挂接图谱「${input.tutorialTitle}」`,
  });

  const concept = await prisma.concept.findUnique({ where: { id: conceptId } });

  return {
    link_id: link.id,
    concept_id: conceptId,
    concept_name: concept?.name ?? input.tutorialTitle,
    credits: {
      save_tutorial: saveCredit,
      link_graph: graphCredit,
    },
  };
}

export async function getLinkedResourcesForConcept(conceptId: number, userId?: number) {
  const where = userId ? { conceptId, userId } : { conceptId };

  const links = await prisma.conceptTutorialLink.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });

  return links.map((link: { localTutorialId: number; tutorialTitle: string | null; subject: string | null; updatedAt: Date }) => ({
    local_tutorial_id: link.localTutorialId,
    tutorial_title: link.tutorialTitle,
    subject: link.subject,
    updated_at: link.updatedAt.toISOString(),
  }));
}
