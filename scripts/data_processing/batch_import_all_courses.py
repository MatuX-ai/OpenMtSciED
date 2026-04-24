"""
批量导入所有STEM课程到Neo4j数据库
包括编程、游戏开发、Arduino、ROS等专项课程
"""

import json
import logging
from pathlib import Path
from datetime import datetime
import sys

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.graph_db.import_to_neo4j_http import Neo4jHTTPImporter

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('batch_import_courses.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def load_courses_from_file(file_path):
    """从JSON文件加载课程数据"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and 'courses' in data:
                return data['courses']
            else:
                logger.error(f"无效的数据格式: {file_path}")
                return []
    except Exception as e:
        logger.error(f"加载文件失败 {file_path}: {e}")
        return []


def import_course_to_neo4j(importer, course, retry_count=3):
    """将单个课程导入Neo4j（带重试机制）"""
    for attempt in range(retry_count):
        try:
            course_id = course.get('course_id', '')
            title = course.get('title', '')
            subject = course.get('subject', '')
            grade_level = course.get('grade_level', '')
            
            # 序列化复杂字段为JSON字符串
            knowledge_points = json.dumps(course.get('knowledge_points', []), ensure_ascii=False)
            experiments = json.dumps(course.get('experiments', []), ensure_ascii=False)
            
            # 处理其他可能的列表/字典字段
            extra_fields = {}
            for key in ['learning_objectives', 'assessment_methods', 'programming_language', 
                        'tools', 'career_paths', 'stem_connections', 'game_engine',
                        'hardware_components', 'ros_version', 'programming_languages']:
                if key in course:
                    value = course[key]
                    if isinstance(value, (list, dict)):
                        extra_fields[key] = json.dumps(value, ensure_ascii=False)
                    else:
                        extra_fields[key] = value
            
            # 构建Cypher查询 - 创建或更新Course节点
            cypher = """
            MERGE (c:Course {course_id: $course_id})
            SET c.title = $title,
                c.subject = $subject,
                c.grade_level = $grade_level,
                c.target_grade = $target_grade,
                c.source = $source,
                c.description = $description,
                c.duration_minutes = $duration_minutes,
                c.complexity = $complexity,
                c.lesson_number = $lesson_number,
                c.knowledge_points_json = $knowledge_points,
                c.experiments_json = $experiments,
                c.course_url = $course_url,
                c.updated_at = datetime()
            """
            
            # 添加额外字段
            for key, value in extra_fields.items():
                cypher += f", c.{key} = ${key}"
            
            cypher += " RETURN c.course_id AS id"
            
            params = {
                'course_id': course_id,
                'title': title,
                'subject': subject,
                'grade_level': grade_level,
                'target_grade': course.get('target_grade', ''),
                'source': course.get('source', ''),
                'description': course.get('description', ''),
                'duration_minutes': course.get('duration_minutes', 0),
                'complexity': course.get('complexity', ''),
                'lesson_number': course.get('lesson_number', 0),
                'knowledge_points': knowledge_points,
                'experiments': experiments,
                'course_url': course.get('course_url', ''),
            }
            params.update(extra_fields)
            
            result = importer.execute_query(cypher, params)
            return True
            
        except Exception as e:
            if attempt < retry_count - 1:
                logger.warning(f"导入失败，重试 {attempt + 1}/{retry_count}: {course.get('course_id', 'unknown')}")
                continue
            else:
                logger.error(f"导入课程失败 {course.get('course_id', 'unknown')}: {e}")
                return False
    
    return False


def create_subject_relationships(importer, courses):
    """创建课程与学科的关系"""
    try:
        subjects = set()
        for course in courses:
            subject = course.get('subject', '')
            if subject:
                subjects.add(subject)
        
        # 创建Subject节点
        for subject in subjects:
            cypher = """
            MERGE (s:Subject {name: $name})
            SET s.category = 'STEM',
                s.updated_at = datetime()
            """
            importer.execute_query(cypher, {'name': subject})
        
        # 创建关系
        for course in courses:
            course_id = course.get('course_id', '')
            subject = course.get('subject', '')
            if course_id and subject:
                cypher = """
                MATCH (c:Course {course_id: $course_id})
                MATCH (s:Subject {name: $subject})
                MERGE (c)-[:BELONGS_TO]->(s)
                """
                importer.execute_query(cypher, {
                    'course_id': course_id,
                    'subject': subject
                })
        
        logger.info(f"✅ 创建了 {len(subjects)} 个学科节点及关系")
        
    except Exception as e:
        logger.error(f"创建学科关系失败: {e}")


def batch_import_courses():
    """批量导入所有课程"""
    
    # 定义要导入的课程文件
    course_files = [
        'data/course_library/programming_stem_courses.json',
        'data/course_library/game_development_courses.json',
        'data/course_library/arduino_courses.json',
        'data/course_library/ros_courses.json',
    ]
    
    logger.info("=" * 60)
    logger.info("开始批量导入STEM课程到Neo4j")
    logger.info("=" * 60)
    
    # 初始化Neo4j导入器
    try:
        importer = Neo4jHTTPImporter()
    except Exception as e:
        logger.error(f"Neo4j连接失败: {e}")
        return
    
    total_imported = 0
    total_failed = 0
    
    for file_path in course_files:
        path = Path(file_path)
        if not path.exists():
            logger.warning(f"文件不存在: {file_path}")
            continue
        
        logger.info(f"\n📂 处理文件: {path.name}")
        
        # 加载课程
        courses = load_courses_from_file(path)
        if not courses:
            logger.warning(f"没有课程数据: {file_path}")
            continue
        
        logger.info(f"  加载了 {len(courses)} 个课程")
        
        # 导入每个课程
        success_count = 0
        fail_count = 0
        
        for i, course in enumerate(courses, 1):
            if import_course_to_neo4j(importer, course):
                success_count += 1
            else:
                fail_count += 1
            
            # 每50个课程显示进度
            if i % 50 == 0:
                logger.info(f"  进度: {i}/{len(courses)} (成功: {success_count}, 失败: {fail_count})")
        
        logger.info(f"  ✅ 完成: {success_count} 成功, {fail_count} 失败")
        
        total_imported += success_count
        total_failed += fail_count
        
        # 创建学科关系
        create_subject_relationships(importer, courses)
    
    # 总结
    logger.info("\n" + "=" * 60)
    logger.info("📊 导入总结")
    logger.info("=" * 60)
    logger.info(f"总成功: {total_imported} 个课程")
    logger.info(f"总失败: {total_failed} 个课程")
    logger.info(f"成功率: {total_imported/(total_imported+total_failed)*100:.1f}%" if (total_imported+total_failed) > 0 else "N/A")
    logger.info("=" * 60)


if __name__ == "__main__":
    batch_import_courses()
