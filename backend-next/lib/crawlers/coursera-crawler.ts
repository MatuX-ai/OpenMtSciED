/**
 * Coursera Crawler
 * TODO: 实现 Coursera 课程爬取逻辑
 */

export interface CourseraCourse {
  id: string;
  title: string;
  description?: string;
  url: string;
}

export async function generateCourseraCourses(): Promise<CourseraCourse[]> {
  console.log('Coursera crawler not implemented yet');
  return [];
}

export async function saveCourses(courses: CourseraCourse[]): Promise<void> {
  console.log(`Saving ${courses.length} Coursera courses`);
}
