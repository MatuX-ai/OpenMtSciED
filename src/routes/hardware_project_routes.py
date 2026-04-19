"""
硬件项目API路由
提供硬件项目的CRUD操作和查询过滤功能
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_, or_

from models.hardware_project import (
    HardwareProjectTemplate,
    HardwareMaterial,
    CodeTemplate,
    HardwareCategory,
    MCUType,
)
from utils.database import get_db
from utils.logger import setup_logger

router = APIRouter(prefix="/api/v1/hardware/projects", tags=["硬件项目"])
logger = setup_logger("INFO")


@router.get("/", response_model=List[dict])
async def list_hardware_projects(
    category: Optional[HardwareCategory] = Query(None, description="项目分类筛选"),
    difficulty: Optional[int] = Query(None, ge=1, le=5, description="难度等级筛选 (1-5)"),
    subject: Optional[str] = Query(None, description="学科筛选"),
    max_cost: Optional[float] = Query(None, gt=0, description="最大成本筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    limit: int = Query(20, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(0, ge=0, description="偏移量"),
    db: AsyncSession = Depends(get_db),
):
    """
    获取硬件项目列表
    
    Args:
        category: 项目分类筛选
        difficulty: 难度等级筛选 (1-5)
        subject: 学科筛选
        max_cost: 最大成本筛选
        search: 搜索关键词
        limit: 返回数量限制
        offset: 偏移量
        db: 数据库会话
        
    Returns:
        List[dict]: 硬件项目列表
    """
    try:
        logger.info("获取硬件项目列表")
        
        # 构建查询
        query = select(HardwareProjectTemplate).options(
            selectinload(HardwareProjectTemplate.materials),
            selectinload(HardwareProjectTemplate.code_templates)
        )
        
        # 应用筛选条件
        filters = []
        
        if category:
            filters.append(HardwareProjectTemplate.category == category)
            
        if difficulty:
            filters.append(HardwareProjectTemplate.difficulty == difficulty)
            
        if subject:
            filters.append(HardwareProjectTemplate.subject.ilike(f"%{subject}%"))
            
        if max_cost:
            filters.append(HardwareProjectTemplate.total_cost <= max_cost)
            
        if search:
            search_filter = or_(
                HardwareProjectTemplate.title.ilike(f"%{search}%"),
                HardwareProjectTemplate.description.ilike(f"%{search}%")
            )
            filters.append(search_filter)
        
        # 只获取激活的项目
        filters.append(HardwareProjectTemplate.is_active == True)
        
        if filters:
            query = query.filter(and_(*filters))
        
        # 添加排序和分页
        query = query.order_by(HardwareProjectTemplate.created_at.desc())
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        projects = result.scalars().all()
        
        # 转换为字典格式
        project_list = [project.to_dict() for project in projects]
        
        logger.info(f"找到 {len(project_list)} 个硬件项目")
        return project_list
        
    except Exception as e:
        logger.error(f"获取硬件项目列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取项目列表失败: {str(e)}")


@router.get("/{project_id}", response_model=dict)
async def get_hardware_project(
    project_id: str = Path(..., description="项目ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    获取单个硬件项目详情
    
    Args:
        project_id: 项目ID
        db: 数据库会话
        
    Returns:
        dict: 硬件项目详情
    """
    try:
        logger.info(f"获取硬件项目详情: {project_id}")
        
        # 查询项目
        query = select(HardwareProjectTemplate).options(
            selectinload(HardwareProjectTemplate.materials),
            selectinload(HardwareProjectTemplate.code_templates)
        ).filter(HardwareProjectTemplate.project_id == project_id)
        
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="硬件项目不存在")
        
        return project.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取硬件项目详情失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取项目详情失败: {str(e)}")


@router.post("/", response_model=dict)
async def create_hardware_project(
    project_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """
    创建新的硬件项目
    
    Args:
        project_data: 项目数据
        db: 数据库会话
        
    Returns:
        dict: 创建的硬件项目
    """
    try:
        logger.info(f"创建硬件项目: {project_data.get('title')}")
        
        # 检查项目ID是否已存在
        existing_query = select(HardwareProjectTemplate).filter(
            HardwareProjectTemplate.project_id == project_data.get('project_id')
        )
        result = await db.execute(existing_query)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="项目ID已存在")
        
        # 创建新项目
        new_project = HardwareProjectTemplate(**project_data)
        db.add(new_project)
        await db.commit()
        await db.refresh(new_project)
        
        logger.info(f"硬件项目创建成功: {new_project.id}")
        return new_project.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"创建硬件项目失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"创建项目失败: {str(e)}")


@router.put("/{project_id}", response_model=dict)
async def update_hardware_project(
    project_id: str = Path(..., description="项目ID"),
    project_data: dict = ...,
    db: AsyncSession = Depends(get_db),
):
    """
    更新硬件项目信息
    
    Args:
        project_id: 项目ID
        project_data: 更新数据
        db: 数据库会话
        
    Returns:
        dict: 更新后的硬件项目
    """
    try:
        logger.info(f"更新硬件项目: {project_id}")
        
        # 获取项目
        query = select(HardwareProjectTemplate).filter(
            HardwareProjectTemplate.project_id == project_id
        )
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="硬件项目不存在")
        
        # 更新字段
        for field, value in project_data.items():
            if hasattr(project, field):
                setattr(project, field, value)
        
        await db.commit()
        await db.refresh(project)
        
        logger.info(f"硬件项目更新成功: {project_id}")
        return project.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"更新硬件项目失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新项目失败: {str(e)}")


@router.delete("/{project_id}")
async def delete_hardware_project(
    project_id: str = Path(..., description="项目ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    删除硬件项目
    
    Args:
        project_id: 项目ID
        db: 数据库会话
        
    Returns:
        dict: 删除结果
    """
    try:
        logger.info(f"删除硬件项目: {project_id}")
        
        # 获取项目
        query = select(HardwareProjectTemplate).filter(
            HardwareProjectTemplate.project_id == project_id
        )
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="硬件项目不存在")
        
        # 删除项目（级联删除相关材料）
        await db.delete(project)
        await db.commit()
        
        logger.info(f"硬件项目删除成功: {project_id}")
        return {"message": "硬件项目删除成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"删除硬件项目失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除项目失败: {str(e)}")


@router.get("/categories", response_model=List[str])
async def get_project_categories(db: AsyncSession = Depends(get_db)):
    """
    获取所有项目分类
    
    Args:
        db: 数据库会话
        
    Returns:
        List[str]: 分类列表
    """
    try:
        logger.info("获取项目分类列表")
        
        # 获取所有不同的分类
        query = select(HardwareProjectTemplate.category).distinct()
        result = await db.execute(query)
        categories = result.scalars().all()
        
        # 转换为字符串列表
        category_list = [cat.value for cat in categories if cat]
        
        return category_list
        
    except Exception as e:
        logger.error(f"获取项目分类失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取分类失败: {str(e)}")


@router.get("/stats/summary")
async def get_project_statistics(db: AsyncSession = Depends(get_db)):
    """
    获取项目统计信息
    
    Args:
        db: 数据库会话
        
    Returns:
        dict: 统计信息
    """
    try:
        logger.info("获取项目统计信息")
        
        # 总项目数
        total_query = select(HardwareProjectTemplate)
        total_result = await db.execute(total_query)
        total_projects = len(total_result.scalars().all())
        
        # 按分类统计
        category_query = select(
            HardwareProjectTemplate.category, 
            func.count(HardwareProjectTemplate.id)
        ).group_by(HardwareProjectTemplate.category)
        category_result = await db.execute(category_query)
        category_stats = {
            cat.value if cat else "unknown": count 
            for cat, count in category_result.all()
        }
        
        # 平均成本
        cost_query = select(func.avg(HardwareProjectTemplate.total_cost))
        cost_result = await db.execute(cost_query)
        avg_cost = cost_result.scalar() or 0
        
        stats = {
            "total_projects": total_projects,
            "category_distribution": category_stats,
            "average_cost": round(avg_cost, 2),
            "budget_compliance": total_projects > 0  # 简单示例
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"获取项目统计失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")