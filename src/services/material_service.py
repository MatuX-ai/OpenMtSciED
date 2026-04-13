"""
统一课件库服务层
处理课件相关的业务逻辑
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

from models.unified_material import UnifiedMaterial
from models.user import User
from models.course import Course
from models.license import Organization

logger = logging.getLogger(__name__)


class MaterialService:
    """课件管理服务类"""

    def __init__(self):
        pass

    def create_material(
        self,
        db: Session,
        user_id: int,
        material_code: str,
        title: str,
        material_type: str,
        category: str,
        file_name: str,
        file_size: int,
        file_hash: str,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        course_id: Optional[int] = None,
        chapter_id: Optional[int] = None,
        lesson_id: Optional[int] = None,
        visibility: str = "course_private",
        download_permission: str = "enrolled",
        arvr_data: Optional[Dict] = None,
        game_data: Optional[Dict] = None,
        animation_data: Optional[Dict] = None,
        experiment_data: Optional[Dict] = None,
    ) -> UnifiedMaterial:
        """
        创建新课件

        Args:
            db: 数据库会话
            user_id: 用户ID
            material_code: 课件编号
            title: 课件标题
            material_type: 课件类型
            category: 课件分类
            file_name: 文件名
            file_size: 文件大小
            file_hash: 文件哈希
            description: 课件描述
            tags: 标签列表
            course_id: 课程ID
            chapter_id: 章节ID
            lesson_id: 课时ID
            visibility: 可见性
            download_permission: 下载权限
            arvr_data: AR/VR数据
            game_data: 游戏数据
            animation_data: 动画数据
            experiment_data: 实验数据

        Returns:
            UnifiedMaterial: 创建的课件对象
        """
        try:
            # 获取用户信息以确定org_id
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError(f"用户 {user_id} 不存在")

            org_id = user.org_id if hasattr(user, 'org_id') and user.org_id else 1

            # 生成文件URL（这里简化处理，实际应该根据存储策略生成）
            file_url = f"/materials/{file_name}"
            file_format = file_name.split('.')[-1].lower() if '.' in file_name else ''

            # 创建课件对象
            material = UnifiedMaterial(
                material_code=material_code,
                title=title,
                description=description,
                type=material_type,
                category=category,
                tags=tags or [],
                file_url=file_url,
                file_name=file_name,
                file_size=file_size,
                file_format=file_format,
                file_hash=file_hash,
                course_id=course_id,
                chapter_id=chapter_id,
                lesson_id=lesson_id,
                org_id=org_id,
                created_by=user_id,
                visibility=visibility,
                download_permission=download_permission,
                arvr_data=arvr_data,
                game_data=game_data,
                animation_data=animation_data,
                experiment_data=experiment_data,
            )

            db.add(material)
            db.commit()
            db.refresh(material)

            logger.info(f"课件创建成功: {material_code} - {title}")
            return material

        except Exception as e:
            db.rollback()
            logger.error(f"创建课件失败: {str(e)}")
            raise

    def get_material(self, db: Session, material_id: int) -> Optional[UnifiedMaterial]:
        """
        获取单个课件

        Args:
            db: 数据库会话
            material_id: 课件ID

        Returns:
            UnifiedMaterial: 课件对象，如果不存在则返回None
        """
        return db.query(UnifiedMaterial).filter(UnifiedMaterial.id == material_id).first()

    def get_materials(
        self,
        db: Session,
        user_id: int,
        user_role: str = "teacher",
        org_id: Optional[int] = None,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: Tuple[str, str] = ("created_at", "desc"),
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """
        获取课件列表（支持筛选、排序、分页）

        Args:
            db: 数据库会话
            user_id: 用户ID
            user_role: 用户角色
            org_id: 机构ID
            filters: 筛选条件
            sort_by: 排序条件 (字段名, 顺序)
            page: 页码
            page_size: 每页数量

        Returns:
            Dict: 包含items和total的字典
        """
        try:
            query = db.query(UnifiedMaterial)

            # 应用权限过滤
            query = self._apply_permission_filter(query, user_id, user_role, org_id)

            # 应用筛选条件
            if filters:
                query = self._apply_filters(query, filters)

            # 获取总数
            total = query.count()

            # 应用排序
            sort_field, sort_order = sort_by
            if sort_order == "desc":
                query = query.order_by(getattr(UnifiedMaterial, sort_field).desc())
            else:
                query = query.order_by(getattr(UnifiedMaterial, sort_field).asc())

            # 应用分页
            offset = (page - 1) * page_size
            materials = query.offset(offset).limit(page_size).all()

            return {
                "items": [material.to_dict() for material in materials],
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size,
            }

        except Exception as e:
            logger.error(f"获取课件列表失败: {str(e)}")
            raise

    def update_material(
        self,
        db: Session,
        material_id: int,
        user_id: int,
        update_data: Dict[str, Any],
    ) -> UnifiedMaterial:
        """
        更新课件

        Args:
            db: 数据库会话
            material_id: 课件ID
            user_id: 用户ID
            update_data: 更新数据

        Returns:
            UnifiedMaterial: 更新后的课件对象
        """
        try:
            material = self.get_material(db, material_id)
            if not material:
                raise ValueError(f"课件 {material_id} 不存在")

            # 检查权限
            if not self._can_edit_material(material, user_id):
                raise PermissionError("无权限编辑此课件")

            # 更新字段
            for key, value in update_data.items():
                if hasattr(material, key) and value is not None:
                    setattr(material, key, value)

            material.updated_by = user_id
            material.updated_at = datetime.utcnow()

            db.commit()
            db.refresh(material)

            logger.info(f"课件更新成功: {material_id}")
            return material

        except Exception as e:
            db.rollback()
            logger.error(f"更新课件失败: {str(e)}")
            raise

    def delete_material(self, db: Session, material_id: int, user_id: int) -> bool:
        """
        删除课件

        Args:
            db: 数据库会话
            material_id: 课件ID
            user_id: 用户ID

        Returns:
            bool: 是否删除成功
        """
        try:
            material = self.get_material(db, material_id)
            if not material:
                raise ValueError(f"课件 {material_id} 不存在")

            # 检查权限
            if not self._can_delete_material(material, user_id):
                raise PermissionError("无权限删除此课件")

            db.delete(material)
            db.commit()

            logger.info(f"课件删除成功: {material_id}")
            return True

        except Exception as e:
            db.rollback()
            logger.error(f"删除课件失败: {str(e)}")
            raise

    def increment_view_count(self, db: Session, material_id: int) -> bool:
        """
        增加查看次数

        Args:
            db: 数据库会话
            material_id: 课件ID

        Returns:
            bool: 是否成功
        """
        try:
            material = self.get_material(db, material_id)
            if material:
                material.view_count = (material.view_count or 0) + 1
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            logger.error(f"增加查看次数失败: {str(e)}")
            return False

    def increment_download_count(self, db: Session, material_id: int) -> bool:
        """
        增加下载次数

        Args:
            db: 数据库会话
            material_id: 课件ID

        Returns:
            bool: 是否成功
        """
        try:
            material = self.get_material(db, material_id)
            if material:
                material.download_count = (material.download_count or 0) + 1
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            logger.error(f"增加下载次数失败: {str(e)}")
            return False

    def get_statistics(self, db: Session, org_id: Optional[int] = None) -> Dict[str, Any]:
        """
        获取课件统计信息

        Args:
            db: 数据库会话
            org_id: 机构ID（可选）

        Returns:
            Dict: 统计信息
        """
        try:
            query = db.query(UnifiedMaterial)

            if org_id:
                query = query.filter(UnifiedMaterial.org_id == org_id)

            total = query.count()
            total_size = query.with_entities(func.sum(UnifiedMaterial.file_size)).scalar() or 0
            total_downloads = query.with_entities(func.sum(UnifiedMaterial.download_count)).scalar() or 0
            total_views = query.with_entities(func.sum(UnifiedMaterial.view_count)).scalar() or 0

            # 按类型统计
            type_stats = (
                db.query(
                    UnifiedMaterial.type,
                    func.count(UnifiedMaterial.id).label('count')
                )
                .group_by(UnifiedMaterial.type)
                .all()
            )

            # 按分类统计
            category_stats = (
                db.query(
                    UnifiedMaterial.category,
                    func.count(UnifiedMaterial.id).label('count')
                )
                .group_by(UnifiedMaterial.category)
                .all()
            )

            return {
                "total_materials": total,
                "total_size_bytes": total_size,
                "total_downloads": total_downloads,
                "total_views": total_views,
                "by_type": {stat.type: stat.count for stat in type_stats},
                "by_category": {stat.category: stat.count for stat in category_stats},
            }

        except Exception as e:
            logger.error(f"获取统计信息失败: {str(e)}")
            raise

    def _apply_permission_filter(
        self,
        query,
        user_id: int,
        user_role: str,
        org_id: Optional[int] = None,
    ):
        """
        应用权限过滤

        Args:
            query: SQLAlchemy查询对象
            user_id: 用户ID
            user_role: 用户角色
            org_id: 机构ID

        Returns:
            过滤后的查询对象
        """
        # 管理员可以看到所有课件
        if user_role == "admin":
            return query

        # 构建权限条件
        conditions = []

        # 公开课件
        conditions.append(UnifiedMaterial.visibility == "public")

        # 机构私有 - 同机构可见
        if org_id:
            conditions.append(
                and_(
                    UnifiedMaterial.visibility == "org_private",
                    UnifiedMaterial.org_id == org_id,
                )
            )

        # 课程私有 - 需要检查用户是否已报名（这里简化处理）
        conditions.append(UnifiedMaterial.visibility == "course_private")

        # 教师私有 - 仅创建者可见
        conditions.append(
            and_(
                UnifiedMaterial.visibility == "teacher_private",
                UnifiedMaterial.created_by == user_id,
            )
        )

        return query.filter(or_(*conditions))

    def _apply_filters(self, query, filters: Dict[str, Any]):
        """
        应用筛选条件

        Args:
            query: SQLAlchemy查询对象
            filters: 筛选条件字典

        Returns:
            过滤后的查询对象
        """
        # 类型筛选
        if 'type' in filters and filters['type']:
            query = query.filter(UnifiedMaterial.type.in_(filters['type']))

        # 分类筛选
        if 'category' in filters and filters['category']:
            query = query.filter(UnifiedMaterial.category.in_(filters['category']))

        # 课程ID筛选
        if 'course_id' in filters and filters['course_id']:
            query = query.filter(UnifiedMaterial.course_id.in_(filters['course_id']))

        # 章节ID筛选
        if 'chapter_id' in filters and filters['chapter_id']:
            query = query.filter(UnifiedMaterial.chapter_id.in_(filters['chapter_id']))

        # 机构ID筛选
        if 'org_id' in filters and filters['org_id']:
            query = query.filter(UnifiedMaterial.org_id.in_(filters['org_id']))

        # 标签搜索
        if 'tags' in filters and filters['tags']:
            # JSON数组包含查询（SQLite可能不支持，需要根据数据库调整）
            for tag in filters['tags']:
                query = query.filter(UnifiedMaterial.tags.contains([tag]))

        # 关键词搜索
        if 'search' in filters and filters['search']:
            search_term = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    UnifiedMaterial.title.like(search_term),
                    UnifiedMaterial.description.like(search_term),
                )
            )

        # 可见性筛选
        if 'visibility' in filters and filters['visibility']:
            query = query.filter(UnifiedMaterial.visibility.in_(filters['visibility']))

        # 创建者筛选
        if 'created_by' in filters and filters['created_by']:
            query = query.filter(UnifiedMaterial.created_by.in_(filters['created_by']))

        # 日期范围筛选
        if 'date_start' in filters and filters['date_start']:
            query = query.filter(UnifiedMaterial.created_at >= filters['date_start'])

        if 'date_end' in filters and filters['date_end']:
            query = query.filter(UnifiedMaterial.created_at <= filters['date_end'])

        # AR/VR类型筛选
        if 'arvr_type' in filters and filters['arvr_type']:
            # 需要在arvr_data中查询，这里简化处理
            pass

        # 设备筛选
        if 'required_device' in filters and filters['required_device']:
            # 需要在arvr_data中查询，这里简化处理
            pass

        return query

    def _can_edit_material(self, material: UnifiedMaterial, user_id: int) -> bool:
        """
        检查是否可以编辑课件

        Args:
            material: 课件对象
            user_id: 用户ID

        Returns:
            bool: 是否有编辑权限
        """
        # 管理员可以编辑所有课件
        # 这里需要从用户表中获取角色，简化处理
        return material.created_by == user_id

    def _can_delete_material(self, material: UnifiedMaterial, user_id: int) -> bool:
        """
        检查是否可以删除课件

        Args:
            material: 课件对象
            user_id: 用户ID

        Returns:
            bool: 是否有删除权限
        """
        # 管理员可以删除所有课件
        # 这里需要从用户表中获取角色，简化处理
        return material.created_by == user_id


# 依赖注入函数
def get_material_service() -> MaterialService:
    """获取课件服务实例"""
    return MaterialService()


def get_arvr_service():
    """获取AR/VR服务实例（占位）"""
    # TODO: 实现AR/VR服务
    return None


def get_game_service():
    """获取游戏服务实例（占位）"""
    # TODO: 实现游戏服务
    return None


def get_experiment_service():
    """获取实验服务实例（占位）"""
    # TODO: 实现实验服务
    return None
