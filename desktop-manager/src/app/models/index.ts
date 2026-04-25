export * from './unified-course.models';
// export * from './unified-material.models'; // 暂时注释掉以避免重复导出冲突
export * from './hardware-project.models';
export * from './user.models';

// 解决重复导出歧义
export { ApiResponse as CourseApiResponse, PaginatedResponse as CoursePaginatedResponse } from './unified-course.models';
export { ApiResponse as MaterialApiResponse, PaginatedResponse as MaterialPaginatedResponse } from './unified-material.models';
