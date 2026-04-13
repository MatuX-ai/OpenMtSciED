"""
课程管理服务
处理课程相关的业务逻辑
"""

from datetime import datetime
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from models.course import (
    Course,
    CourseCategory,
    CourseCreate,
    CourseEnrollment,
    CourseEnrollmentCreate,
    CourseStatus,
    CourseUpdate,
    EnrollmentStatus,
)
from models.user import User, UserRole

logger = logging.getLogger(__name__)


class CourseService:
    """课程管理服务类"""

    def __init__(self, db: Session):
        self.db = db

    def create_course(
        self, org_id: int, course_data: CourseCreate, current_user: User
    ) -> Course:
        """
        创建新课程

        Args:
            org_id: 组织ID
            course_data: 课程创建数据
            current_user: 当前用户

        Returns:
            Course: 创建的课程对象

        Raises:
            ValueError: 数据验证失败
            Exception: 创建失败
        """
        try:
            # 验证用户权限
            if not self._can_create_course(current_user):
                raise ValueError("无权创建课程")

            # 验证课程代码唯一性
            existing_course = (
                self.db.query(Course)
                .filter(
                    Course.code == course_data.code.upper(), Course.org_id == org_id
                )
                .first()
            )

            if existing_course:
                raise ValueError(f"课程代码 '{course_data.code}' 已存在")

            # 验证分类存在性
            if course_data.category_id:
                category = (
                    self.db.query(CourseCategory)
                    .filter(
                        CourseCategory.id == course_data.category_id,
                        CourseCategory.org_id == org_id,
                    )
                    .first()
                )
                if not category:
                    raise ValueError("指定的课程分类不存在")

            # 验证讲师存在性
            if course_data.instructor_id:
                instructor = (
                    self.db.query(User)
                    .filter(
                        User.id == course_data.instructor_id, User.is_active == True
                    )
                    .first()
                )
                if not instructor:
                    raise ValueError("指定的讲师不存在")

            # 创建课程对象
            course_dict = course_data.dict()
            course_dict["code"] = course_dict["code"].upper()  # 统一转为大写
            course_dict["org_id"] = org_id

            course = Course(**course_dict)

            # 保存到数据库
            self.db.add(course)
            self.db.commit()
            self.db.refresh(course)

            logger.info(f"课程创建成功: {course.code} (ID: {course.id})")
            return course

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建课程失败: {e}")
            raise

    def list_courses(
        self,
        org_id: int,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Course]:
        """
        获取课程列表

        Args:
            org_id: 组织ID
            skip: 跳过的记录数
            limit: 返回记录数
            filters: 筛选条件

        Returns:
            List[Course]: 课程列表
        """
        try:
            query = self.db.query(Course).filter(Course.org_id == org_id)

            if filters:
                # 状态筛选
                if "status" in filters:
                    query = query.filter(Course.status == filters["status"])

                # 分类筛选
                if "category_id" in filters:
                    query = query.filter(Course.category_id == filters["category_id"])

                # 讲师筛选
                if "instructor_id" in filters:
                    query = query.filter(
                        Course.instructor_id == filters["instructor_id"]
                    )

                # 推荐课程筛选
                if "is_featured" in filters:
                    query = query.filter(Course.is_featured == filters["is_featured"])

                # 搜索筛选
                if "search" in filters and filters["search"]:
                    search_term = f"%{filters['search']}%"
                    query = query.filter(
                        or_(
                            Course.title.like(search_term),
                            Course.code.like(search_term),
                            Course.description.like(search_term),
                        )
                    )

            # 按创建时间降序排列
            query = query.order_by(Course.created_at.desc())

            courses = query.offset(skip).limit(limit).all()
            return courses

        except Exception as e:
            logger.error(f"获取课程列表失败: {e}")
            return []

    def get_course(self, org_id: int, course_id: int) -> Optional[Course]:
        """
        获取课程详情

        Args:
            org_id: 组织ID
            course_id: 课程ID

        Returns:
            Optional[Course]: 课程对象，如果不存在返回None
        """
        try:
            course = (
                self.db.query(Course)
                .filter(Course.id == course_id, Course.org_id == org_id)
                .first()
            )

            return course
        except Exception as e:
            logger.error(f"获取课程详情失败: {e}")
            return None

    def update_course(
        self,
        org_id: int,
        course_id: int,
        course_update: CourseUpdate,
        current_user: User,
    ) -> Optional[Course]:
        """
        更新课程信息

        Args:
            org_id: 组织ID
            course_id: 课程ID
            course_update: 更新数据
            current_user: 当前用户

        Returns:
            Optional[Course]: 更新后的课程对象，如果不存在返回None
        """
        try:
            course = self.get_course(org_id, course_id)
            if not course:
                return None

            # 验证权限
            if not self._can_update_course(current_user, course):
                raise ValueError("无权更新此课程")

            # 验证课程代码唯一性（如果要更新的话）
            if course_update.code and course_update.code.upper() != course.code:
                existing_course = (
                    self.db.query(Course)
                    .filter(
                        Course.code == course_update.code.upper(),
                        Course.org_id == org_id,
                        Course.id != course_id,
                    )
                    .first()
                )

                if existing_course:
                    raise ValueError(f"课程代码 '{course_update.code}' 已存在")

            # 更新字段
            update_data = course_update.dict(exclude_unset=True)
            if "code" in update_data:
                update_data["code"] = update_data["code"].upper()

            for field, value in update_data.items():
                if hasattr(course, field):
                    setattr(course, field, value)

            course.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(course)

            logger.info(f"课程更新成功: {course.code} (ID: {course.id})")
            return course

        except Exception as e:
            self.db.rollback()
            logger.error(f"更新课程失败: {e}")
            raise

    def delete_course(self, org_id: int, course_id: int, current_user: User) -> bool:
        """
        删除课程

        Args:
            org_id: 组织ID
            course_id: 课程ID
            current_user: 当前用户

        Returns:
            bool: 是否删除成功
        """
        try:
            course = self.get_course(org_id, course_id)
            if not course:
                return False

            # 验证权限
            if not self._can_delete_course(current_user, course):
                raise ValueError("无权删除此课程")

            # 检查是否有相关的选课记录
            enrollment_count = (
                self.db.query(CourseEnrollment)
                .filter(CourseEnrollment.course_id == course_id)
                .count()
            )

            if enrollment_count > 0:
                raise ValueError("该课程已有学生选课，无法删除")

            # 软删除：设置为非活跃状态
            course.is_active = False
            course.status = CourseStatus.ARCHIVED
            course.updated_at = datetime.utcnow()

            self.db.commit()
            logger.info(f"课程删除成功: {course.code} (ID: {course.id})")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"删除课程失败: {e}")
            return False

    def create_category(
        self, org_id: int, category_data: Dict[str, Any]
    ) -> CourseCategory:
        """
        创建课程分类

        Args:
            org_id: 组织ID
            category_data: 分类数据

        Returns:
            CourseCategory: 创建的分类对象
        """
        try:
            # 验证父分类存在性
            parent_id = category_data.get("parent_id")
            if parent_id:
                parent_category = (
                    self.db.query(CourseCategory)
                    .filter(
                        CourseCategory.id == parent_id, CourseCategory.org_id == org_id
                    )
                    .first()
                )
                if not parent_category:
                    raise ValueError("指定的父分类不存在")

            # 创建分类对象
            category = CourseCategory(
                org_id=org_id,
                name=category_data["name"],
                description=category_data.get("description"),
                parent_id=parent_id,
                is_active=category_data.get("is_active", True),
                sort_order=category_data.get("sort_order", 0),
            )

            self.db.add(category)
            self.db.commit()
            self.db.refresh(category)

            logger.info(f"课程分类创建成功: {category.name} (ID: {category.id})")
            return category

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建课程分类失败: {e}")
            raise

    def list_categories(
        self, org_id: int, include_inactive: bool = False
    ) -> List[CourseCategory]:
        """
        获取课程分类列表

        Args:
            org_id: 组织ID
            include_inactive: 是否包含非活跃分类

        Returns:
            List[CourseCategory]: 分类列表
        """
        try:
            query = self.db.query(CourseCategory).filter(
                CourseCategory.org_id == org_id
            )

            if not include_inactive:
                query = query.filter(CourseCategory.is_active == True)

            categories = query.order_by(
                CourseCategory.sort_order, CourseCategory.name
            ).all()
            return categories

        except Exception as e:
            logger.error(f"获取课程分类列表失败: {e}")
            return []

    def create_enrollment(
        self, org_id: int, enrollment_data: CourseEnrollmentCreate, current_user: User
    ) -> CourseEnrollment:
        """
        创建选课记录

        Args:
            org_id: 组织ID
            enrollment_data: 选课数据
            current_user: 当前用户

        Returns:
            CourseEnrollment: 创建的选课记录
        """
        try:
            # 验证课程存在性
            course = self.get_course(org_id, enrollment_data.course_id)
            if not course:
                raise ValueError("指定的课程不存在")

            # 验证课程是否可以选课
            if not course.is_enrollable:
                raise ValueError("该课程当前不可选课")

            # 验证学生存在性
            student = (
                self.db.query(User)
                .filter(User.id == enrollment_data.student_id, User.is_active == True)
                .first()
            )

            if not student:
                raise ValueError("指定的学生不存在")

            # 检查是否已经选课
            existing_enrollment = (
                self.db.query(CourseEnrollment)
                .filter(
                    CourseEnrollment.course_id == enrollment_data.course_id,
                    CourseEnrollment.student_id == enrollment_data.student_id,
                    CourseEnrollment.org_id == org_id,
                )
                .first()
            )

            if existing_enrollment:
                raise ValueError("该学生已经选了这门课程")

            # 检查课程容量
            if course.current_students >= course.max_students:
                raise ValueError("课程已满，无法选课")

            # 创建选课记录
            enrollment = CourseEnrollment(
                org_id=org_id,
                course_id=enrollment_data.course_id,
                student_id=enrollment_data.student_id,
                status=enrollment_data.status,
            )

            self.db.add(enrollment)

            # 更新课程当前学生数
            course.current_students += 1
            course.updated_at = datetime.utcnow()

            self.db.commit()
            self.db.refresh(enrollment)

            logger.info(f"选课记录创建成功: 课程ID {course.id}, 学生ID {student.id}")
            return enrollment

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建选课记录失败: {e}")
            raise

    def get_course_enrollments(
        self, org_id: int, course_id: int, status: Optional[EnrollmentStatus] = None
    ) -> List[CourseEnrollment]:
        """
        获取课程选课列表

        Args:
            org_id: 组织ID
            course_id: 课程ID
            status: 选课状态筛选

        Returns:
            List[CourseEnrollment]: 选课记录列表
        """
        try:
            query = self.db.query(CourseEnrollment).filter(
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.org_id == org_id,
            )

            if status:
                query = query.filter(CourseEnrollment.status == status)

            enrollments = query.order_by(CourseEnrollment.enrollment_date.desc()).all()
            return enrollments

        except Exception as e:
            logger.error(f"获取课程选课列表失败: {e}")
            return []

    def get_student_enrollments(
        self, org_id: int, student_id: int, status: Optional[EnrollmentStatus] = None
    ) -> List[CourseEnrollment]:
        """
        获取学生选课列表

        Args:
            org_id: 组织ID
            student_id: 学生ID
            status: 选课状态筛选

        Returns:
            List[CourseEnrollment]: 选课记录列表
        """
        try:
            query = self.db.query(CourseEnrollment).filter(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.org_id == org_id,
            )

            if status:
                query = query.filter(CourseEnrollment.status == status)

            enrollments = query.order_by(CourseEnrollment.enrollment_date.desc()).all()
            return enrollments

        except Exception as e:
            logger.error(f"获取学生选课列表失败: {e}")
            return []

    def get_course_statistics(self, org_id: int) -> Dict[str, Any]:
        """
        获取课程统计信息

        Args:
            org_id: 组织ID

        Returns:
            Dict[str, Any]: 统计信息
        """
        try:
            # 总课程数
            total_courses = (
                self.db.query(Course).filter(Course.org_id == org_id).count()
            )

            # 各状态课程数
            published_courses = (
                self.db.query(Course)
                .filter(
                    Course.org_id == org_id, Course.status == CourseStatus.PUBLISHED
                )
                .count()
            )

            draft_courses = (
                self.db.query(Course)
                .filter(Course.org_id == org_id, Course.status == CourseStatus.DRAFT)
                .count()
            )

            archived_courses = (
                self.db.query(Course)
                .filter(Course.org_id == org_id, Course.status == CourseStatus.ARCHIVED)
                .count()
            )

            # 总选课人数
            total_enrollments = (
                self.db.query(CourseEnrollment)
                .filter(CourseEnrollment.org_id == org_id)
                .count()
            )

            # 完成的选课数
            completed_enrollments = (
                self.db.query(CourseEnrollment)
                .filter(
                    CourseEnrollment.org_id == org_id,
                    CourseEnrollment.status == EnrollmentStatus.COMPLETED,
                )
                .count()
            )

            # 平均完成率
            completion_rate = (
                (completed_enrollments / total_enrollments * 100)
                if total_enrollments > 0
                else 0
            )

            # 热门课程（选课人数最多的前5个）
            popular_courses = (
                self.db.query(
                    Course.title,
                    Course.code,
                    func.count(CourseEnrollment.id).label("enrollment_count"),
                )
                .join(CourseEnrollment)
                .filter(Course.org_id == org_id)
                .group_by(Course.id)
                .order_by(func.count(CourseEnrollment.id).desc())
                .limit(5)
                .all()
            )

            return {
                "total_courses": total_courses,
                "published_courses": published_courses,
                "draft_courses": draft_courses,
                "archived_courses": archived_courses,
                "total_enrollments": total_enrollments,
                "completed_enrollments": completed_enrollments,
                "completion_rate": round(completion_rate, 2),
                "popular_courses": [
                    {
                        "title": course.title,
                        "code": course.code,
                        "enrollment_count": course.enrollment_count,
                    }
                    for course in popular_courses
                ],
                "generated_at": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"获取课程统计信息失败: {e}")
            return {"error": str(e)}

    def search_courses(self, org_id: int, query: str, limit: int = 20) -> List[Course]:
        """
        搜索课程

        Args:
            org_id: 组织ID
            query: 搜索关键词
            limit: 返回记录数

        Returns:
            List[Course]: 搜索结果
        """
        try:
            search_term = f"%{query}%"
            courses = (
                self.db.query(Course)
                .filter(
                    Course.org_id == org_id,
                    Course.is_active == True,
                    or_(
                        Course.title.like(search_term),
                        Course.code.like(search_term),
                        Course.description.like(search_term),
                        Course.short_description.like(search_term),
                    ),
                )
                .order_by(Course.created_at.desc())
                .limit(limit)
                .all()
            )

            return courses

        except Exception as e:
            logger.error(f"搜索课程失败: {e}")
            return []

    def can_view_student_enrollments(self, current_user: User, student_id: int) -> bool:
        """
        检查用户是否有权限查看学生的选课信息

        Args:
            current_user: 当前用户
            student_id: 学生ID

        Returns:
            bool: 是否有权限
        """
        # 管理员可以查看所有学生的选课信息
        if current_user.is_superuser or current_user.role in [
            UserRole.ADMIN,
            UserRole.ORG_ADMIN,
        ]:
            return True

        # 学生本人可以查看自己的选课信息
        if current_user.id == student_id:
            return True

        # 讲师可以查看自己授课课程的学生选课信息
        # 这里需要更复杂的逻辑来检查讲师权限
        return False

    def _can_create_course(self, user: User) -> bool:
        """检查用户是否有创建课程的权限"""
        return user.is_superuser or user.role in [UserRole.ADMIN, UserRole.ORG_ADMIN]

    def _can_update_course(self, user: User, course: Course) -> bool:
        """检查用户是否有更新课程的权限"""
        # 管理员可以更新所有课程
        if user.is_superuser or user.role in [UserRole.ADMIN, UserRole.ORG_ADMIN]:
            return True

        # 讲师可以更新自己授课的课程
        if user.role == UserRole.USER and course.instructor_id == user.id:
            return True

        return False

    def _can_delete_course(self, user: User, course: Course) -> bool:
        """检查用户是否有删除课程的权限"""
        # 只有管理员可以删除课程
        return user.is_superuser or user.role in [UserRole.ADMIN, UserRole.ORG_ADMIN]
