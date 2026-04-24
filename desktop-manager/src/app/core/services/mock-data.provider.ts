import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnifiedCourse } from '../../models/unified-course.models';

export interface MockDataProvider {
  getCourses(): Observable<UnifiedCourse[]>;
  getCourse(id: number): Observable<UnifiedCourse>;
}

export class DefaultMockDataProvider implements MockDataProvider {
  getCourses(): Observable<UnifiedCourse[]> {
    return of([
      {
        id: 1,
        course_code: 'STEM-001',
        title: 'Scratch 编程入门',
        description: '通过图形化编程学习计算思维，适合6-10岁儿童',
        category: 'programming',
        level: 'beginner',
        total_lessons: 12,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as UnifiedCourse,
    ]);
  }

  getCourse(id: number): Observable<UnifiedCourse> {
    return this.getCourses().pipe(
      // In a real scenario, we would filter by ID. 
      // For this simple mock, we just return the first one or throw.
      map(courses => courses[0] || ({} as UnifiedCourse))
    );
  }
}
