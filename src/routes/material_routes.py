"""
统一课件库后端API路由

支持24种课件类型的完整CRUD操作
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import mimetypes
import json
import hashlib
import enum
from pydantic import BaseModel, Field, validator

# 导入数据库依赖
from utils.database import get_sync_db

# 导入服务
from services.material_service import (
    MaterialService,
    get_material_service,
    get_arvr_service,
    get_game_service,
    get_experiment_service
)

# ==================== 数据模型（Pydantic） ====================

class MaterialBase(BaseModel):
    """课件基础模型"""
    material_code: str = Field(..., description="课件编号")
    title: str = Field(..., min_length=1, max_length=200, description="课件标题")
    description: Optional[str] = Field(None, max_length=1000, description="课件描述")
    type: str = Field(..., description="课件类型")
    category: str = Field(..., description="课件分类")
    tags: Optional[str] = Field(None, description="标签，逗号分隔")
    course_id: Optional[int] = Field(None, description="关联课程ID")
    chapter_id: Optional[int] = Field(None, description="关联章节ID")
    lesson_id: Optional[int] = Field(None, description="关联课时ID")
    visibility: str = Field(default="course_private", description="可见性")
    download_permission: str = Field(default="enrolled", description="下载权限")

    # AR/VR数据
    arvr_data: Optional[dict] = Field(None, description="AR/VR数据JSON")

    # 游戏数据
    game_data: Optional[dict] = Field(None, description="游戏数据JSON")

    # 动画数据
    animation_data: Optional[dict] = Field(None, description="动画数据JSON")

    # 实验数据
    experiment_data: Optional[dict] = Field(None, description="实验数据JSON")


class MaterialUpdate(BaseModel):
    """课件更新模型"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    tags: Optional[str] = Field(None)
    visibility: Optional[str] = Field(None)
    download_permission: Optional[str] = Field(None)
    arvr_data: Optional[dict] = None
    game_data: Optional[dict] = None
    animation_data: Optional[dict] = None
    experiment_data: Optional[dict] = None


class MaterialFilter(BaseModel):
    """课件筛选模型"""
    type: Optional[str] = Field(None, description="课件类型，逗号分隔")
    category: Optional[str] = Field(None, description="课件分类，逗号分隔")
    course_id: Optional[str] = Field(None, description="课程ID，逗号分隔")
    chapter_id: Optional[str] = Field(None, description="章节ID，逗号分隔")
    org_id: Optional[str] = Field(None, description="机构ID，逗号分隔")
    tags: Optional[str] = Field(None, description="标签搜索")
    search: Optional[str] = Field(None, description="搜索关键词")
    visibility: Optional[str] = Field(None, description="可见性，逗号分隔")
    created_by: Optional[str] = Field(None, description="创建者ID，逗号分隔")
    date_start: Optional[str] = Field(None, description="开始日期 YYYY-MM-DD")
    date_end: Optional[str] = Field(None, description="结束日期 YYYY-MM-DD")
    arvr_type: Optional[str] = Field(None, description="AR/VR类型，逗号分隔")
    required_device: Optional[str] = Field(None, description="所需设备，逗号分隔")


class MaterialSortOption(str, enum.Enum):
    """课件排序选项"""
    newest = "newest"
    oldest = "oldest"
    most_downloaded = "most_downloaded"
    most_viewed = "most_viewed"
    most_liked = "most_liked"
    name_asc = "name_asc"
    name_desc = "name_desc"
    size_asc = "size_asc"
    size_desc = "size_desc"


class ShareLinkRequest(BaseModel):
    """分享链接请求"""
    expire_hours: Optional[int] = Field(None, ge=1, le=720, description="有效期（小时）")
    password: Optional[str] = Field(None, min_length=4, max_length=20, description="访问密码")


class StatisticsResponse(BaseModel):
    """统计响应"""
    material_id: int
    download_count: int
    view_count: int
    like_count: int
    share_count: int
    comment_count: int
    unique_visitors: int
    unique_downloaders: int
    downloads_last_7_days: int
    downloads_last_30_days: int
    views_last_7_days: int
    views_last_30_days: int
    download_by_region: dict = {}
    view_by_region: dict = {}


# ==================== 文件大小限制（字节） ====================

FILE_SIZE_LIMITS = {
    # 文档类
    'document_pdf': 50 * 1024 * 1024,         # 50MB
    'document_word': 25 * 1024 * 1024,       # 25MB
    'document_ppt': 100 * 1024 * 1024,        # 100MB
    'document_excel': 25 * 1024 * 1024,      # 25MB

    # 视频类
    'video_teaching': 2 * 1024 * 1024 * 1024,  # 2GB
    'video_screen': 2 * 1024 * 1024 * 1024,     # 2GB
    'video_live': 0,                              # 直播无限制

    # 音频类
    'audio_teaching': 500 * 1024,               # 500KB
    'audio_recording': 500 * 1024,              # 500KB

    # 图片类
    'image': 20 * 1024 * 1024,                # 20MB

    # 代码类
    'code_source': 50 * 1024 * 1024,            # 50MB
    'code_example': 10 * 1024 * 1024,           # 10MB
    'code_project': 100 * 1024 * 1024,           # 100MB

    # 游戏类
    'game_interactive': 50 * 1024 * 1024,         # 50MB
    'game_simulation': 100 * 1024 * 1024,         # 100MB

    # 动画类
    'animation_2d': 500 * 1024 * 1024,           # 500MB
    'animation_3d': 2 * 1024 * 1024 * 1024,      # 2GB

    # AR/VR类
    'ar_model': 500 * 1024 * 1024,              # 500MB
    'vr_experience': 5 * 1024 * 1024 * 1024,      # 5GB
    'arvr_scene': 2 * 1024 * 1024 * 1024,        # 2GB

    # 模型类
    'model_3d': 100 * 1024 * 1024,            # 100MB
    'model_robot': 100 * 1024 * 1024,           # 100MB

    # 实验类
    'experiment_config': 1 * 1024 * 1024,          # 1MB
    'experiment_template': 5 * 1024 * 1024,       # 5MB

    # 其他类
    'archive': 500 * 1024 * 1024,              # 500MB
    'external_link': 0                           # 外部链接无限制
}


# ==================== 支持的文件扩展名 ====================

SUPPORTED_EXTENSIONS = {
    # 文档类
    'document_pdf': ['.pdf'],
    'document_word': ['.doc', '.docx'],
    'document_ppt': ['.ppt', '.pptx'],
    'document_excel': ['.xls', '.xlsx'],

    # 视频类
    'video_teaching': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    'video_screen': ['.mp4', '.webm'],
    'video_live': ['.m3u8'],

    # 音频类
    'audio_teaching': ['.mp3', '.wav', '.m4a', '.aac'],
    'audio_recording': ['.mp3', '.wav'],

    # 图片类
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'],

    # 代码类
    'code_source': ['.py', '.js', '.ts', '.java', '.cpp', '.go', '.rs', '.c', '.h'],
    'code_example': ['.py', '.js', '.ts', '.md', '.json'],
    'code_project': ['.zip', '.tar.gz', '.rar'],

    # 游戏类
    'game_interactive': ['.html', '.htm', '.zip'],
    'game_simulation': ['.html', '.zip', '.json'],

    # 动画类
    'animation_2d': ['.mp4', '.webm', '.gif', '.svg'],
    'animation_3d': ['.mp4', '.glb', '.gltf', '.fbx'],

    # AR/VR类
    'ar_model': ['.usdz', '.reality', '.arobject', '.glb', '.gltf'],
    'vr_experience': ['.glb', '.gltf', '.fbx', '.obj'],
    'arvr_scene': ['.zip', '.tar'],

    # 模型类
    'model_3d': ['.obj', '.stl', '.fbx', '.dae', '.ply', '.3ds'],
    'model_robot': ['.urdf', '.sdf', '.gazebo', '.xacro'],

    # 实验类
    'experiment_config': ['.json', '.yaml', '.yml', '.xml'],
    'experiment_template': ['.json', '.yaml', '.zip'],

    # 其他类
    'archive': ['.zip', '.rar', '.7z', '.tar', '.tar.gz'],
    'external_link': []
}


# ==================== 文件类型检测 ====================

def get_material_type_from_filename(filename: str) -> Optional[str]:
    """从文件名推断课件类型"""
    ext = os.path.splitext(filename)[1].lower()

    for material_type, extensions in SUPPORTED_EXTENSIONS.items():
        if ext in extensions:
            return material_type

    return None


def validate_file_size(file_size: int, material_type: str) -> bool:
    """验证文件大小是否在限制内"""
    limit = FILE_SIZE_LIMITS.get(material_type, 0)
    if limit > 0 and file_size > limit:
        raise HTTPException(
            status_code=413,
            detail=f"文件大小超过限制: {format_file_size(limit)}"
        )
    return True


def format_file_size(size_bytes: int) -> str:
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes} {unit}"
        size_bytes /= 1024
        if size_bytes < 1024:
            return f"{size_bytes} {unit}"
        size_bytes /= 1024


# ==================== 路由器 ====================

router = APIRouter(
    prefix="/api/v1/materials",
    tags=["统一课件库"],
    responses={
        200: {"description": "成功"},
        201: {"description": "创建成功"},
        400: {"description": "请求参数错误"},
        401: {"description": "未授权"},
        403: {"description": "无权限"},
        404: {"description": "资源不存在"},
        413: {"description": "文件过大"},
        415: {"description": "不支持的文件类型"},
        422: {"description": "验证失败"},
        429: {"description": "请求过多"},
        500: {"description": "服务器错误"}
    }
)


# ==================== 依赖注入 ====================

def get_material_service(
    material_service: MaterialService = Depends(get_material_service)
) -> MaterialService:
    return material_service


def get_current_user() -> dict:
    """
    获取当前用户
    这里应该从 JWT token 或 session 中获取当前用户
    简化实现，返回模拟用户对象
    """
    return {
        "id": 1,
        "username": "test_user",
        "role": "teacher",
        "org_id": 1
    }


# ==================== CRUD接口 ====================

@router.post("/courses", response_model=dict, summary="创建课件")
async def create_material(
    file: UploadFile = File(..., description="课件文件"),
    material_data: str = Form(..., description="课件数据JSON"),
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    创建新的课件
    """
    try:
        # 解析课件数据
        data = json.loads(material_data)

        # 验证必填字段
        if 'title' not in data or not data['title'].strip():
            raise HTTPException(
                status_code=400,
                detail="课件标题不能为空"
            )

        # 验证课件类型
        material_type = data.get('type')
        if not material_type:
            raise HTTPException(
                status_code=400,
                detail="课件类型不能为空"
            )

        # 验证文件
        if not file:
            raise HTTPException(
                status_code=400,
                detail="课件文件不能为空"
            )

        # 验证文件类型
        file_type = get_material_type_from_filename(file.filename)
        if file_type != material_type:
            raise HTTPException(
                status_code=415,
                detail=f"文件类型与课件类型不匹配: 期望 {material_type}，实际 {file_type}"
            )

        # 验证文件大小
        file_size = 0
        for chunk in file.file:
            file_size += len(chunk)

        if not validate_file_size(file_size, material_type):
            return  # 大小验证已抛出异常

        # 读取文件内容并计算MD5
        file_content = await file.read()
        file_hash = hashlib.md5(file_content).hexdigest()

        # 生成课件编号
        import random
        import string
        material_code = f"MAT-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

        # 调用服务创建课件
        material = material_service.create_material(
            db=db,
            user_id=current_user['id'],
            material_code=material_code,
            title=data['title'],
            description=data.get('description'),
            material_type=material_type,
            category=data.get('category', 'course_material'),
            tags=data.get('tags', '').split(',') if data.get('tags') else [],
            file_name=file.filename,
            file_size=file_size,
            file_hash=file_hash,
            course_id=data.get('course_id'),
            chapter_id=data.get('chapter_id'),
            lesson_id=data.get('lesson_id'),
            visibility=data.get('visibility', 'course_private'),
            download_permission=data.get('download_permission', 'enrolled'),
            arvr_data=data.get('arvr_data'),
            game_data=data.get('game_data'),
            animation_data=data.get('animation_data'),
            experiment_data=data.get('experiment_data')
        )

        return {
            "success": True,
            "data": material,
            "message": "课件创建成功"
        }

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="课件数据格式错误"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"创建课件失败: {str(e)}"
        )


@router.get("", response_model=dict, summary="获取课件列表")
def get_materials(
    type: Optional[str] = None,
    category: Optional[str] = None,
    course_id: Optional[str] = None,
    chapter_id: Optional[str] = None,
    org_id: Optional[str] = None,
    tags: Optional[str] = None,
    search: Optional[str] = None,
    visibility: Optional[str] = None,
    created_by: Optional[str] = None,
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    arvr_type: Optional[str] = None,
    required_device: Optional[str] = None,
    sort: Optional[MaterialSortOption] = None,
    page: int = 1,
    page_size: int = 20,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    获取课件列表，支持筛选、排序、分页
    """
    try:
        # 构建筛选条件
        filters = {}

        if type:
            filters['type'] = type.split(',')
        if category:
            filters['category'] = category.split(',')
        if course_id:
            filters['course_id'] = [int(cid) for cid in course_id.split(',')]
        if chapter_id:
            filters['chapter_id'] = [int(cid) for cid in chapter_id.split(',')]
        if org_id:
            filters['org_id'] = [int(oid) for oid in org_id.split(',')]
        if tags:
            filters['tags'] = tags.split(',')
        if visibility:
            filters['visibility'] = visibility.split(',')
        if created_by:
            filters['created_by'] = [int(uid) for uid in created_by.split(',')]
        if date_start:
            filters['date_start'] = datetime.strptime(date_start, '%Y-%m-%d')
        if date_end:
            filters['date_end'] = datetime.strptime(date_end, '%Y-%m-%d')
        if arvr_type:
            filters['arvr_type'] = arvr_type.split(',')
        if required_device:
            filters['required_device'] = required_device.split(',')

        # 构建排序条件
        sort_by = 'created_at'
        sort_order = 'desc'
        if sort:
            sort_by = {
                MaterialSortOption.newest: ('created_at', 'desc'),
                MaterialSortOption.oldest: ('created_at', 'asc'),
                MaterialSortOption.most_downloaded: ('download_count', 'desc'),
                MaterialSortOption.most_viewed: ('view_count', 'desc'),
                MaterialSortOption.most_liked: ('like_count', 'desc'),
                MaterialSortOption.name_asc: ('title', 'asc'),
                MaterialSortOption.name_desc: ('title', 'desc'),
                MaterialSortOption.size_asc: ('file_size', 'asc'),
                MaterialSortOption.size_desc: ('file_size', 'desc'),
            }.get(sort, ('created_at', 'desc'))
            sort_order = sort_by[1]

        # 调用服务获取列表
        result = material_service.get_materials(
            db=db,
            user_id=current_user['id'],
            user_role=current_user.get('role', 'teacher'),
            org_id=current_user.get('org_id'),
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )

        return {
            "success": True,
            "data": result,
            "message": "获取课件列表成功"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取课件列表失败: {str(e)}"
        )


@router.get("/{material_id}", response_model=dict, summary="获取课件详情")
def get_material(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    获取课件详情
    """
    try:
        material = material_service.get_material(db=db, material_id=material_id)

        if not material:
            raise HTTPException(
                status_code=404,
                detail="课件不存在"
            )

        # 检查访问权限
        if not check_material_access(material, current_user):
            raise HTTPException(
                status_code=403,
                detail="无权限访问此课件"
            )

        # 增加查看次数
        material_service.increment_view_count(db=db, material_id=material_id)

        return {
            "success": True,
            "data": material,
            "message": "获取课件详情成功"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取课件详情失败: {str(e)}"
        )


@router.put("/{material_id}", response_model=dict, summary="更新课件")
def update_material(
    material_id: int,
    material_data: MaterialUpdate,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    更新课件
    """
    try:
        # 检查课件是否存在
        existing_material = material_service.get_material(db=db, material_id=material_id)
        if not existing_material:
            raise HTTPException(
                status_code=404,
                detail="课件不存在"
            )

        # 检查编辑权限
        if not check_material_edit_permission(existing_material, current_user):
            raise HTTPException(
                status_code=403,
                detail="无权限编辑此课件"
            )

        # 调用服务更新课件
        material = material_service.update_material(
            db=db,
            material_id=material_id,
            user_id=current_user['id'],
            update_data=material_data.dict(exclude_none=True)
        )

        return {
            "success": True,
            "data": material,
            "message": "课件更新成功"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"更新课件失败: {str(e)}"
        )


@router.delete("/{material_id}", response_model=dict, summary="删除课件")
def delete_material(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    删除课件
    """
    try:
        # 检查课件是否存在
        existing_material = material_service.get_material(db=db, material_id=material_id)
        if not existing_material:
            raise HTTPException(
                status_code=404,
                detail="课件不存在"
            )

        # 检查删除权限
        if not check_material_delete_permission(existing_material, current_user):
            raise HTTPException(
                status_code=403,
                detail="无权限删除此课件"
            )

        # 调用服务删除课件
        material_service.delete_material(db=db, material_id=material_id)

        return {
            "success": True,
            "message": "课件删除成功"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"删除课件失败: {str(e)}"
        )


@router.post("/batch-delete", response_model=dict, summary="批量删除课件")
def batch_delete_materials(
    material_ids: List[int],
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    批量删除课件
    """
    try:
        if not material_ids or len(material_ids) == 0:
            raise HTTPException(
                status_code=400,
                detail="课件ID列表不能为空"
            )

        # 检查批量删除权限
        if current_user.get('role') != 'admin':
            raise HTTPException(
                status_code=403,
                detail="只有管理员可以批量删除课件"
            )

        # 批量删除
        deleted_count = material_service.batch_delete_materials(db=db, material_ids=material_ids)

        return {
            "success": True,
            "data": {"deleted_count": deleted_count},
            "message": f"成功删除{deleted_count}个课件"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"批量删除课件失败: {str(e)}"
        )


# ==================== 文件操作接口 ====================

@router.post("/upload", response_model=dict, summary="上传课件文件")
async def upload_material_file(
    file: UploadFile = File(..., description="课件文件"),
    material_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    上传课件文件（用于已存在课件的文件更新）
    """
    try:
        # 验证文件
        if not file:
            raise HTTPException(
                status_code=400,
                detail="文件不能为空"
            )

        # 如果指定了material_id，检查权限
        if material_id:
            material = material_service.get_material(db=db, material_id=material_id)
            if not material:
                raise HTTPException(
                    status_code=404,
                    detail="课件不存在"
                )
            if not check_material_edit_permission(material, current_user):
                raise HTTPException(
                    status_code=403,
                    detail="无权限编辑此课件"
                )

        # 计算文件大小
        file_size = 0
        for chunk in file.file:
            file_size += len(chunk)

        # 读取文件内容并计算MD5
        file_content = await file.read()
        file_hash = hashlib.md5(file_content).hexdigest()

        # 生成文件URL（简化实现）
        file_url = f"/materials/files/{file.filename}"

        return {
            "success": True,
            "data": {
                "file_url": file_url,
                "file_size": file_size,
                "file_hash": file_hash
            },
            "message": "文件上传成功"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"文件上传失败: {str(e)}"
        )


@router.get("/{material_id}/download", response_model=dict, summary="下载课件")
async def download_material(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    下载课件文件
    """
    try:
        material = material_service.get_material(db=db, material_id=material_id)

        if not material:
            raise HTTPException(
                status_code=404,
                detail="课件不存在"
            )

        # 检查下载权限
        if not check_material_download_permission(material, current_user):
            raise HTTPException(
                status_code=403,
                detail="无权限下载此课件"
            )

        # 增加下载次数
        material_service.increment_download_count(db=db, material_id=material_id)

        # 增加下载记录
        material_service.record_download(
            db=db,
            material_id=material_id,
            user_id=current_user['id']
        )

        # 返回文件（简化实现）
        from fastapi.responses import FileResponse
        return FileResponse(
            path=material.file_path,
            filename=material.file_name,
            media_type='application/octet-stream'
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"下载课件失败: {str(e)}"
        )


# ==================== 分享和统计接口 ====================

@router.post("/{material_id}/share-link", response_model=dict, summary="获取分享链接")
def get_share_link(
    material_id: int,
    request: ShareLinkRequest,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    生成课件分享链接
    """
    try:
        material = material_service.get_material(db=db, material_id=material_id)

        if not material:
            raise HTTPException(
                status_code=404,
                detail="课件不存在"
            )

        # 检查分享权限
        if not check_material_share_permission(material, current_user):
            raise HTTPException(
                status_code=403,
                detail="无权限分享此课件"
            )

        # 计算过期时间
        expire_at = datetime.now()
        if request.expire_hours:
            expire_at += timedelta(hours=request.expire_hours)
        else:
            expire_at += timedelta(days=7)  # 默认7天

        # 生成分享代码
        import random
        import string
        share_code = ''.join(random.choices(string.ascii_uppercase, k=6))

        # 创建分享链接
        share_url = f"https://imato.com/materials/share/{share_code}"

        # 保存分享信息
        material_service.create_share_link(
            db=db,
            material_id=material_id,
            user_id=current_user['id'],
            share_code=share_code,
            share_url=share_url,
            expire_at=expire_at,
            password=request.password
        )

        return {
            "success": True,
            "data": {
                "share_url": share_url,
                "share_code": share_code,
                "expire_at": expire_at.isoformat(),
                "access_password": "****" if request.password else None
            },
            "message": "分享链接生成成功"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"生成分享链接失败: {str(e)}"
        )


@router.post("/{material_id}/track-download", response_model=dict, summary="跟踪下载")
def track_material_download(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    跟踪课件下载
    """
    try:
        material_service.record_download(
            db=db,
            material_id=material_id,
            user_id=current_user['id']
        )
        return {
            "success": True,
            "message": "下载跟踪成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"下载跟踪失败: {str(e)}"
        )


@router.post("/{material_id}/track-view", response_model=dict, summary="跟踪查看")
def track_material_view(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    跟踪课件查看
    """
    try:
        material_service.increment_view_count(db=db, material_id=material_id)
        return {
            "success": True,
            "message": "查看跟踪成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"查看跟踪失败: {str(e)}"
        )


@router.post("/{material_id}/like", response_model=dict, summary="点赞课件")
def like_material(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    点赞课件
    """
    try:
        material_service.toggle_like(db=db, material_id=material_id, user_id=current_user['id'], like=True)
        return {
            "success": True,
            "message": "点赞成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"点赞失败: {str(e)}"
        )


@router.delete("/{material_id}/like", response_model=dict, summary="取消点赞")
def unlike_material(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    取消点赞课件
    """
    try:
        material_service.toggle_like(db=db, material_id=material_id, user_id=current_user['id'], like=False)
        return {
            "success": True,
            "message": "取消点赞成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"取消点赞失败: {str(e)}"
        )


@router.post("/{material_id}/favorite", response_model=dict, summary="收藏课件")
def favorite_material(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    收藏课件
    """
    try:
        material_service.toggle_favorite(db=db, material_id=material_id, user_id=current_user['id'], favorite=True)
        return {
            "success": True,
            "message": "收藏成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"收藏失败: {str(e)}"
        )


@router.delete("/{material_id}/favorite", response_model=dict, summary="取消收藏")
def unfavorite_material(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    取消收藏课件
    """
    try:
        material_service.toggle_favorite(db=db, material_id=material_id, user_id=current_user['id'], favorite=False)
        return {
            "success": True,
            "message": "取消收藏成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"取消收藏失败: {str(e)}"
        )


@router.get("/{material_id}/statistics", response_model=dict, summary="获取课件统计")
def get_material_statistics(
    material_id: int,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    获取课件统计数据
    """
    try:
        stats = material_service.get_material_statistics(db=db, material_id=material_id)

        return {
            "success": True,
            "data": stats,
            "message": "获取统计成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取统计失败: {str(e)}"
        )


@router.get("/users/{user_id}/recommended", response_model=dict, summary="获取推荐课件")
def get_user_recommended_materials(
    user_id: int,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    material_service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_sync_db)
):
    """
    获取用户推荐课件
    """
    try:
        materials = material_service.get_recommended_materials(
            db=db,
            user_id=user_id,
            limit=limit
        )

        return {
            "success": True,
            "data": materials,
            "message": "获取推荐课件成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取推荐课件失败: {str(e)}"
        )


# ==================== 权限检查函数 ====================

def check_material_access(material, user: dict) -> bool:
    """检查课件访问权限"""
    # 公开课件
    if material.visibility == 'public':
        return True

    # 机构私有 - 同机构可访问
    if material.visibility == 'org_private':
        return user.get('org_id') == material.org_id

    # 课程私有 - 已报名可访问
    if material.visibility == 'course_private':
        # TODO: 检查用户是否已报名
        return True

    # 教师私有 - 仅创建者可访问
    if material.visibility == 'teacher_private':
        return user.get('id') == material.created_by

    return False


def check_material_edit_permission(material, user: dict) -> bool:
    """检查课件编辑权限"""
    # 管理员可编辑所有课件
    if user.get('role') == 'admin':
        return True

    # 创建者可编辑自己的课件
    return user.get('id') == material.created_by


def check_material_delete_permission(material, user: dict) -> bool:
    """检查课件删除权限"""
    # 管理员可删除所有课件
    if user.get('role') == 'admin':
        return True

    # 创建者可删除自己的课件
    return user.get('id') == material.created_by


def check_material_download_permission(material, user: dict) -> bool:
    """检查课件下载权限"""
    download_permission = material.download_permission

    # 所有人可下载
    if download_permission == 'all':
        return True

    # 已报名学员可下载
    if download_permission == 'enrolled':
        # TODO: 检查用户是否已报名
        return True

    # 教师可下载
    if download_permission == 'teacher':
        return user.get('role') in ['teacher', 'admin']

    # 管理员可下载
    if download_permission == 'admin':
        return user.get('role') == 'admin'

    return False


def check_material_share_permission(material, user: dict) -> bool:
    """检查课件分享权限"""
    # 管理员可分享所有课件
    if user.get('role') == 'admin':
        return True

    # 创建者可分享自己的课件
    return user.get('id') == material.created_by
