"""资源关联服务 - 处理教程、课件、硬件之间的关联关系"""

import json
import os
from typing import List, Dict, Optional
from pathlib import Path


class ResourceAssociationService:
    """资源关联服务"""
    
    def __init__(self):
        # 项目根目录：g:\OpenMTSciEd
        # __file__ = g:\OpenMTSciEd\backend\openmtscied\modules\resources\services\association_service.py
        # parent^6 = g:\OpenMTSciEd
        self.project_root = Path(__file__).parent.parent.parent.parent.parent.parent
        self.data_dir = self.project_root / "data"
        self.course_library_dir = self.data_dir / "course_library"
        self.textbook_library_dir = self.data_dir / "textbook_library"
        self.hardware_projects_file = self.data_dir / "hardware_projects.json"
        self.knowledge_graph_file = self.data_dir / "knowledge_graph.json"
        self.associations_file = self.data_dir / "resource_associations.json"
        
        # 缓存数据
        self._tutorials_cache = None
        self._materials_cache = None
        self._hardware_cache = None
        self._graph_cache = None
        self._associations_cache = None
    
    def _load_tutorials(self) -> List[Dict]:
        """加载所有教程"""
        if self._tutorials_cache is not None:
            return self._tutorials_cache
        
        tutorials = []
        if self.course_library_dir.exists():
            for file_path in self.course_library_dir.glob("*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            tutorials.extend(data)
                        elif isinstance(data, dict):
                            tutorials.append(data)
                except Exception as e:
                    print(f"加载教程文件 {file_path} 失败: {e}")
        
        self._tutorials_cache = tutorials
        return tutorials
    
    def _load_materials(self) -> List[Dict]:
        """加载所有课件"""
        if self._materials_cache is not None:
            return self._materials_cache
        
        materials = []
        if self.textbook_library_dir.exists():
            for file_path in self.textbook_library_dir.glob("*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            materials.extend(data)
                        elif isinstance(data, dict):
                            materials.append(data)
                except Exception as e:
                    print(f"加载课件文件 {file_path} 失败: {e}")
        
        self._materials_cache = materials
        return materials
    
    def _load_hardware_projects(self) -> List[Dict]:
        """加载硬件项目"""
        if self._hardware_cache is not None:
            return self._hardware_cache
        
        if self.hardware_projects_file.exists():
            try:
                with open(self.hardware_projects_file, 'r', encoding='utf-8') as f:
                    self._hardware_cache = json.load(f)
            except Exception as e:
                print(f"加载硬件项目失败: {e}")
                self._hardware_cache = []
        else:
            self._hardware_cache = []
        
        return self._hardware_cache
    
    def _load_knowledge_graph(self) -> Dict:
        """加载知识图谱"""
        if self._graph_cache is not None:
            return self._graph_cache
        
        if self.knowledge_graph_file.exists():
            try:
                with open(self.knowledge_graph_file, 'r', encoding='utf-8') as f:
                    self._graph_cache = json.load(f)
            except Exception as e:
                print(f"加载知识图谱失败: {e}")
                self._graph_cache = {"nodes": [], "links": []}
        else:
            self._graph_cache = {"nodes": [], "links": []}
        
        return self._graph_cache
    
    def get_related_materials_for_tutorial(self, tutorial_id: str, subject: Optional[str] = None) -> List[Dict]:
        """获取教程相关的课件"""
        tutorials = self._load_tutorials()
        materials = self._load_materials()
        
        # 找到目标教程
        target_tutorial = None
        for tutorial in tutorials:
            if tutorial.get('course_id') == tutorial_id or tutorial.get('id') == tutorial_id:
                target_tutorial = tutorial
                break
        
        if not target_tutorial:
            return []
        
        # 基于学科匹配相关课件
        tutorial_subject = subject or target_tutorial.get('subject', '')
        if not tutorial_subject:
            return []
        
        related_materials = []
        for material in materials:
            material_subject = material.get('subject', '')
            if material_subject == tutorial_subject:
                # 可以添加更多匹配逻辑，如关键词匹配等
                related_materials.append(material)
        
        return related_materials[:10]  # 限制返回数量
    
    def get_required_hardware_for_material(self, material_id: str, subject: Optional[str] = None) -> List[Dict]:
        """获取课件所需的硬件项目"""
        materials = self._load_materials()
        hardware_projects = self._load_hardware_projects()
        
        # 找到目标课件
        target_material = None
        for material in materials:
            if material.get('chapter_id') == material_id or material.get('id') == material_id:
                target_material = material
                break
        
        if not target_material:
            return []
        
        # 基于学科匹配相关硬件
        material_subject = subject or target_material.get('subject', '')
        if not material_subject:
            return []
        
        required_hardware = []
        for project in hardware_projects:
            project_subject = project.get('subject', '')
            if project_subject == material_subject:
                required_hardware.append(project)
        
        return required_hardware[:10]  # 限制返回数量
    
    def get_complete_learning_path(self, tutorial_id: str) -> Dict:
        """获取完整的学习路径：教程 -> 课件 -> 硬件"""
        tutorials = self._load_tutorials()
        
        # 找到目标教程
        target_tutorial = None
        for tutorial in tutorials:
            if tutorial.get('course_id') == tutorial_id or tutorial.get('id') == tutorial_id:
                target_tutorial = tutorial
                break
        
        if not target_tutorial:
            return {
                "tutorial": None,
                "related_materials": [],
                "required_hardware": []
            }
        
        # 获取相关课件
        related_materials = self.get_related_materials_for_tutorial(
            tutorial_id, 
            target_tutorial.get('subject')
        )
        
        # 获取所需硬件（基于第一个相关课件）
        required_hardware = []
        if related_materials:
            first_material = related_materials[0]
            required_hardware = self.get_required_hardware_for_material(
                first_material.get('chapter_id', ''),
                target_tutorial.get('subject')
            )
        
        return {
            "tutorial": target_tutorial,
            "related_materials": related_materials,
            "required_hardware": required_hardware
        }
    
    def search_resources_by_keyword(self, keyword: str) -> Dict:
        """根据关键词搜索相关资源"""
        tutorials = self._load_tutorials()
        materials = self._load_materials()
        hardware_projects = self._load_hardware_projects()
        
        keyword_lower = keyword.lower()
        
        # 搜索教程
        matched_tutorials = [
            t for t in tutorials
            if keyword_lower in str(t.get('title', '')).lower() or
               keyword_lower in str(t.get('description', '')).lower() or
               keyword_lower in str(t.get('subject', '')).lower()
        ]
        
        # 搜索课件
        matched_materials = [
            m for m in materials
            if keyword_lower in str(m.get('title', '')).lower() or
               keyword_lower in str(m.get('textbook', '')).lower() or
               keyword_lower in str(m.get('subject', '')).lower()
        ]
        
        # 搜索硬件项目
        matched_hardware = [
            h for h in hardware_projects
            if keyword_lower in str(h.get('title', '')).lower() or
               keyword_lower in str(h.get('description', '')).lower() or
               keyword_lower in str(h.get('subject', '')).lower()
        ]
        
        return {
            "tutorials": matched_tutorials[:10],
            "materials": matched_materials[:10],
            "hardware_projects": matched_hardware[:10]
        }
    
    def _load_associations(self) -> List[Dict]:
        """加载所有关联关系"""
        if self._associations_cache is not None:
            return self._associations_cache
        
        print(f"[DEBUG] 尝试加载关联文件: {self.associations_file}")
        print(f"[DEBUG] 文件存在: {self.associations_file.exists()}")
        
        if self.associations_file.exists():
            try:
                with open(self.associations_file, 'r', encoding='utf-8') as f:
                    self._associations_cache = json.load(f)
                print(f"[DEBUG] 成功加载 {len(self._associations_cache)} 条关联")
            except Exception as e:
                print(f"加载关联关系失败: {e}")
                self._associations_cache = []
        else:
            self._associations_cache = []
        
        return self._associations_cache
    
    def _save_associations(self, associations: List[Dict]) -> None:
        """保存关联关系到文件"""
        try:
            with open(self.associations_file, 'w', encoding='utf-8') as f:
                json.dump(associations, f, ensure_ascii=False, indent=2)
            self._associations_cache = associations
        except Exception as e:
            print(f"保存关联关系失败: {e}")
            raise
    
    def get_all_associations(self, filter_type: str = 'all') -> List[Dict]:
        """获取所有关联关系"""
        associations = self._load_associations()
        
        if filter_type == 'all':
            return associations
        elif filter_type == 'tutorial-material':
            return [a for a in associations if a['source_type'] == 'tutorial' and a['target_type'] == 'material']
        elif filter_type == 'material-hardware':
            return [a for a in associations if a['source_type'] == 'material' and a['target_type'] == 'hardware']
        else:
            return associations
    
    def create_association(self, association: Dict) -> Dict:
        """创建新的关联关系"""
        import uuid
        from datetime import datetime
        
        associations = self._load_associations()
        
        # 生成唯一ID
        new_assoc = {
            "id": f"assoc-{uuid.uuid4().hex[:8]}",
            "source_id": association['source_id'],
            "source_type": association['source_type'],
            "target_id": association['target_id'],
            "target_type": association['target_type'],
            "relevance_score": association.get('relevance_score', 0.8),
            "created_at": datetime.now().isoformat() + "Z"
        }
        
        associations.append(new_assoc)
        self._save_associations(associations)
        
        return new_assoc
    
    def delete_association(self, assoc_id: str) -> bool:
        """删除关联关系"""
        associations = self._load_associations()
        
        original_count = len(associations)
        associations = [a for a in associations if a['id'] != assoc_id]
        
        if len(associations) < original_count:
            self._save_associations(associations)
            return True
        else:
            return False
    
    def get_association_stats(self) -> Dict:
        """获取关联统计信息"""
        associations = self._load_associations()
        
        tutorial_material = len([a for a in associations if a['source_type'] == 'tutorial' and a['target_type'] == 'material'])
        material_hardware = len([a for a in associations if a['source_type'] == 'material' and a['target_type'] == 'hardware'])
        
        avg_relevance = 0
        if associations:
            avg_relevance = sum(a.get('relevance_score', 0) for a in associations) / len(associations)
        
        return {
            "totalAssociations": len(associations),
            "tutorialMaterialLinks": tutorial_material,
            "materialHardwareLinks": material_hardware,
            "avgRelevance": avg_relevance * 100
        }
