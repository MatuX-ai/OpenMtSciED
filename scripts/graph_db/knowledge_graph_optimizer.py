"""
知识图谱关系优化器
自动建立跨平台递进关系和基于内容相似度的推荐
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('knowledge_graph_optimizer.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class KnowledgeGraphOptimizer:
    """知识图谱关系优化器"""
    
    def __init__(self):
        self.course_library_dir = Path("data/course_library")
        self.textbook_library_dir = Path("data/textbook_library")
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    def load_all_courses(self) -> List[Dict[str, Any]]:
        """加载所有平台的课程数据"""
        all_courses = []
        
        # 加载course_library中的所有JSON文件
        if self.course_library_dir.exists():
            for json_file in self.course_library_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        courses = json.load(f)
                        if isinstance(courses, list):
                            all_courses.extend(courses)
                            logger.info(f"加载 {json_file.name}: {len(courses)} 个课程")
                except Exception as e:
                    logger.error(f"加载 {json_file} 失败: {e}")
        
        # 加载textbook_library中的所有JSON文件
        if self.textbook_library_dir.exists():
            for json_file in self.textbook_library_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        courses = json.load(f)
                        if isinstance(courses, list):
                            all_courses.extend(courses)
                            logger.info(f"加载 {json_file.name}: {len(courses)} 个课程")
                except Exception as e:
                    logger.error(f"加载 {json_file} 失败: {e}")
        
        logger.info(f"总共加载 {len(all_courses)} 个课程")
        return all_courses
    
    def extract_course_text(self, course: Dict[str, Any]) -> str:
        """提取课程的文本内容用于相似度计算"""
        text_parts = []
        
        # 标题
        if 'title' in course:
            text_parts.append(course['title'])
        
        # 描述
        if 'description' in course:
            text_parts.append(course['description'])
        
        # 知识点
        if 'knowledge_points' in course:
            for kp in course['knowledge_points']:
                if 'name' in kp:
                    text_parts.append(kp['name'])
                if 'description' in kp:
                    text_parts.append(kp['description'])
        
        # 学科和级别
        if 'subject' in course:
            text_parts.append(course['subject'])
        if 'grade_level' in course:
            text_parts.append(course['grade_level'])
        
        return ' '.join(text_parts)
    
    def calculate_content_similarity(self, courses: List[Dict[str, Any]]) -> List[Tuple[int, int, float]]:
        """计算课程间的内容相似度"""
        logger.info("计算课程间的内容相似度...")
        
        # 提取所有课程的文本内容
        texts = [self.extract_course_text(course) for course in courses]
        
        # 过滤空文本
        valid_indices = [i for i, text in enumerate(texts) if text.strip()]
        valid_texts = [texts[i] for i in valid_indices]
        
        if len(valid_texts) < 2:
            logger.warning("有效文本数量不足，无法计算相似度")
            return []
        
        # TF-IDF向量化
        try:
            tfidf_matrix = self.vectorizer.fit_transform(valid_texts)
            
            # 计算余弦相似度
            similarity_matrix = cosine_similarity(tfidf_matrix)
            
            # 提取高相似度对（相似度 > 0.3）
            similar_pairs = []
            threshold = 0.3
            
            for i in range(len(valid_indices)):
                for j in range(i + 1, len(valid_indices)):
                    similarity = similarity_matrix[i][j]
                    if similarity > threshold:
                        original_i = valid_indices[i]
                        original_j = valid_indices[j]
                        similar_pairs.append((original_i, original_j, similarity))
            
            # 按相似度排序
            similar_pairs.sort(key=lambda x: x[2], reverse=True)
            
            logger.info(f"找到 {len(similar_pairs)} 对高相似度课程")
            return similar_pairs
            
        except Exception as e:
            logger.error(f"计算相似度失败: {e}")
            return []
    
    def establish_progressive_relationships(self, courses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """建立跨平台递进关系"""
        logger.info("建立跨平台递进关系...")
        
        progressive_relationships = []
        
        # 按学科分组
        subject_groups = {}
        for i, course in enumerate(courses):
            subject = course.get('subject', 'unknown')
            if subject not in subject_groups:
                subject_groups[subject] = []
            subject_groups[subject].append((i, course))
        
        # 为每个学科建立递进关系
        for subject, subject_courses in subject_groups.items():
            if len(subject_courses) < 2:
                continue
            
            # 按难度级别排序
            level_order = {'elementary': 1, 'middle': 2, 'high': 3, 'university': 4}
            sorted_courses = sorted(
                subject_courses, 
                key=lambda x: level_order.get(x[1].get('grade_level', ''), 0)
            )
            
            # 建立相邻级别的递进关系
            for i in range(len(sorted_courses) - 1):
                idx1, course1 = sorted_courses[i]
                idx2, course2 = sorted_courses[i + 1]
                
                level1 = course1.get('grade_level', '')
                level2 = course2.get('grade_level', '')
                
                # 只在相邻级别间建立关系
                if (level1 in ['elementary', 'middle'] and level2 == 'middle') or \
                   (level1 == 'middle' and level2 == 'high') or \
                   (level1 == 'high' and level2 == 'university'):
                    
                    relationship = {
                        "source_course_id": course1.get('course_id') or course1.get('unit_id') or course1.get('chapter_id'),
                        "target_course_id": course2.get('course_id') or course2.get('unit_id') or course2.get('chapter_id'),
                        "relationship_type": "PROGRESSES_TO",
                        "source_platform": course1.get('source', 'unknown'),
                        "target_platform": course2.get('source', 'unknown'),
                        "subject": subject,
                        "source_level": level1,
                        "target_level": level2,
                        "confidence": 0.8,
                        "created_at": datetime.now().isoformat()
                    }
                    progressive_relationships.append(relationship)
        
        logger.info(f"建立了 {len(progressive_relationships)} 条递进关系")
        return progressive_relationships
    
    def establish_similarity_relationships(self, courses: List[Dict[str, Any]], 
                                         similar_pairs: List[Tuple[int, int, float]]) -> List[Dict[str, Any]]:
        """建立基于内容相似度的推荐关系"""
        logger.info("建立基于内容相似度的推荐关系...")
        
        similarity_relationships = []
        
        for idx1, idx2, similarity in similar_pairs:
            if idx1 >= len(courses) or idx2 >= len(courses):
                continue
                
            course1 = courses[idx1]
            course2 = courses[idx2]
            
            # 避免同一平台内的重复推荐
            if course1.get('source') == course2.get('source'):
                continue
            
            relationship = {
                "source_course_id": course1.get('course_id') or course1.get('unit_id') or course1.get('chapter_id'),
                "target_course_id": course2.get('course_id') or course2.get('unit_id') or course2.get('chapter_id'),
                "relationship_type": "SIMILAR_TO",
                "source_platform": course1.get('source', 'unknown'),
                "target_platform": course2.get('source', 'unknown'),
                "similarity_score": float(similarity),
                "subject": course1.get('subject', course2.get('subject', 'unknown')),
                "created_at": datetime.now().isoformat()
            }
            similarity_relationships.append(relationship)
        
        logger.info(f"建立了 {len(similarity_relationships)} 条相似度推荐关系")
        return similarity_relationships
    
    def optimize_knowledge_graph(self):
        """执行完整的知识图谱优化"""
        logger.info("="*60)
        logger.info("开始知识图谱关系优化")
        logger.info("="*60)
        
        try:
            # 1. 加载所有课程数据
            courses = self.load_all_courses()
            if not courses:
                logger.warning("没有找到课程数据")
                return
            
            # 2. 计算内容相似度
            similar_pairs = self.calculate_content_similarity(courses)
            
            # 3. 建立递进关系
            progressive_relationships = self.establish_progressive_relationships(courses)
            
            # 4. 建立相似度推荐关系
            similarity_relationships = self.establish_similarity_relationships(courses, similar_pairs)
            
            # 5. 保存关系数据
            relationships_data = {
                "progressive_relationships": progressive_relationships,
                "similarity_relationships": similarity_relationships,
                "optimization_timestamp": datetime.now().isoformat(),
                "total_courses_processed": len(courses),
                "total_similar_pairs_found": len(similar_pairs)
            }
            
            output_file = Path("data/knowledge_graph_relationships.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(relationships_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"✅ 知识图谱关系优化完成")
            logger.info(f"📊 处理课程数: {len(courses)}")
            logger.info(f"🔗 递进关系数: {len(progressive_relationships)}")
            logger.info(f"🎯 相似度关系数: {len(similarity_relationships)}")
            logger.info(f"💾 结果保存到: {output_file}")
            logger.info("="*60)
            
            return relationships_data
            
        except Exception as e:
            logger.error(f"❌ 知识图谱优化失败: {e}", exc_info=True)
            raise


def main():
    """主函数"""
    optimizer = KnowledgeGraphOptimizer()
    optimizer.optimize_knowledge_graph()


if __name__ == "__main__":
    main()