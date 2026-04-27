/**
 * BNU Shanghai Crawler
 * TODO: 实现北师大上海课程爬取逻辑
 */

export interface BNUCourse {
  id: string;
  title: string;
  description?: string;
  url: string;
}

export async function generateBNUCourses(): Promise<BNUCourse[]> {
  console.log('BNU Shanghai crawler not implemented yet');
  return [];
}

export async function saveCourses(courses: BNUCourse[]): Promise<void> {
  console.log(`Saving ${courses.length} BNU courses`);
}
