"""资源关联 API 路由"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
from .services.association_service import ResourceAssociationService

router = APIRouter()
association_service = ResourceAssociationService()


class AssociationCreateRequest(BaseModel):
    """创建关联请求模型"""
    source_id: str
    source_type: str
    target_id: str
    target_type: str
    relevance_score: float = 0.8


@router.get("/tutorials/{tutorial_id}/related-materials")
def get_related_materials(
    tutorial_id: str,
    subject: Optional[str] = Query(None, description="学科过滤")
):
    """
    获取教程相关的课件列表
    """
    try:
        related_materials = association_service.get_related_materials_for_tutorial(
            tutorial_id, 
            subject
        )
        
        return {
            "success": True,
            "data": related_materials,
            "total": len(related_materials),
            "tutorial_id": tutorial_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取相关课件失败: {str(e)}")


@router.get("/materials/{material_id}/required-hardware")
def get_required_hardware(
    material_id: str,
    subject: Optional[str] = Query(None, description="学科过滤")
):
    """
    获取课件所需的硬件项目列表
    """
    try:
        required_hardware = association_service.get_required_hardware_for_material(
            material_id,
            subject
        )
        
        return {
            "success": True,
            "data": required_hardware,
            "total": len(required_hardware),
            "material_id": material_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取所需硬件失败: {str(e)}")


@router.get("/learning-path/{tutorial_id}")
def get_complete_learning_path(tutorial_id: str):
    """
    获取完整的学习路径：教程 -> 课件 -> 硬件
    """
    try:
        learning_path = association_service.get_complete_learning_path(tutorial_id)
        
        if not learning_path["tutorial"]:
            raise HTTPException(status_code=404, detail=f"未找到教程: {tutorial_id}")
        
        return {
            "success": True,
            "data": learning_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取学习路径失败: {str(e)}")


@router.get("/search-resources")
def search_resources_by_keyword(keyword: str = Query(..., min_length=1)):
    """
    根据关键词搜索相关资源（教程、课件、硬件）
    """
    try:
        results = association_service.search_resources_by_keyword(keyword)
        
        return {
            "success": True,
            "data": results,
            "keyword": keyword
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索资源失败: {str(e)}")


@router.get("/hardware/{hardware_id}/related-resources")
def get_hardware_related_resources(
    hardware_id: str,
    subject: Optional[str] = Query(None, description="学科过滤")
):
    """
    获取硬件项目相关的教程和课件（反向关联）
    """
    try:
        # 这里需要实现反向查询逻辑
        # 暂时返回空列表，后续可以基于学科匹配
        return {
            "success": True,
            "data": {
                "related_tutorials": [],
                "related_materials": []
            },
            "hardware_id": hardware_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取硬件相关资源失败: {str(e)}")


@router.get("/resources/summary")
def get_resources_summary():
    """
    获取所有资源的概览统计
    """
    try:
        tutorials = association_service._load_tutorials()
        materials = association_service._load_materials()
        hardware_projects = association_service._load_hardware_projects()
        
        # 统计各学科的资源数量
        subject_stats = {}
        
        # 教程学科统计
        for tutorial in tutorials:
            subject = tutorial.get('subject', '未分类')
            if subject not in subject_stats:
                subject_stats[subject] = {"tutorials": 0, "materials": 0, "hardware": 0}
            subject_stats[subject]["tutorials"] += 1
        
        # 课件学科统计
        for material in materials:
            subject = material.get('subject', '未分类')
            if subject not in subject_stats:
                subject_stats[subject] = {"tutorials": 0, "materials": 0, "hardware": 0}
            subject_stats[subject]["materials"] += 1
        
        # 硬件项目学科统计
        for project in hardware_projects:
            subject = project.get('subject', '未分类')
            if subject not in subject_stats:
                subject_stats[subject] = {"tutorials": 0, "materials": 0, "hardware": 0}
            subject_stats[subject]["hardware"] += 1
        
        return {
            "success": True,
            "data": {
                "total_tutorials": len(tutorials),
                "total_materials": len(materials),
                "total_hardware": len(hardware_projects),
                "subject_distribution": subject_stats
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取资源概览失败: {str(e)}")


@router.get("/associations")
def get_associations(
    filter_type: str = Query('all', description="筛选类型: all, tutorial-material, material-hardware")
):
    """
    获取所有关联关系列表
    """
    try:
        associations = association_service.get_all_associations(filter_type)
        
        return {
            "success": True,
            "data": associations,
            "total": len(associations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取关联列表失败: {str(e)}")


@router.get("/associations/stats")
def get_associations_stats():
    """
    获取关联统计信息
    """
    try:
        stats = association_service.get_association_stats()
        
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")


@router.post("/associations")
def create_association(request: AssociationCreateRequest):
    """
    创建新的关联关系
    """
    try:
        association_data = request.dict()
        new_assoc = association_service.create_association(association_data)
        
        return {
            "success": True,
            "data": new_assoc,
            "message": "关联创建成功"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建关联失败: {str(e)}")


@router.delete("/associations/{assoc_id}")
def delete_association(assoc_id: str):
    """
    删除关联关系
    """
    try:
        success = association_service.delete_association(assoc_id)
        
        if success:
            return {
                "success": True,
                "message": "关联删除成功"
            }
        else:
            raise HTTPException(status_code=404, detail=f"未找到关联: {assoc_id}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除关联失败: {str(e)}")
