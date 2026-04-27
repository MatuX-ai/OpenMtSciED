/**
 * Khan Academy Crawler
 * TODO: 实现可汗学院课程爬取逻辑
 */

export interface KhanAcademyCourse {
  id: string;
  title: string;
  description?: string;
  url: string;
}

export async function generateKhanAcademyCourses(): Promise<KhanAcademyCourse[]> {
  console.log('Khan Academy crawler not implemented yet');
  return [];
}

export async function saveCourses(courses: KhanAcademyCourse[]): Promise<void> {
  console.log(`Saving ${courses.length} Khan Academy courses`);
}
