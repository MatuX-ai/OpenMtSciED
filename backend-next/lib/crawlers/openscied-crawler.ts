/**
 * OpenSciEd Crawler
 * TODO: 实现 OpenSciEd 单元爬取逻辑
 */

export interface OpenSciEdUnit {
  id: string;
  title: string;
  description?: string;
  url: string;
}

export async function generateOpenSciEdUnits(): Promise<OpenSciEdUnit[]> {
  console.log('OpenSciEd crawler not implemented yet');
  return [];
}

export async function saveUnits(units: OpenSciEdUnit[]): Promise<void> {
  console.log(`Saving ${units.length} OpenSciEd units`);
}
