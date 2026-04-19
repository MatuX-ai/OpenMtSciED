"""
数据验证和质量检查工具
验证爬取的教育数据是否符合要求
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class DataValidator:
    """数据验证器"""
    
    def __init__(self):
        self.course_library_dir = Path("data/course_library")
        self.textbook_library_dir = Path("data/textbook_library")
        
    def validate_openscied_data(self) -> Dict[str, Any]:
        """验证OpenSciEd数据"""
        logger.info("="*60)
        logger.info("验证OpenSciEd数据")
        logger.info("="*60)
        
        result = {
            "total_units": 0,
            "by_grade": {},
            "valid_units": 0,
            "invalid_units": 0,
            "issues": []
        }
        
        # 检查所有OpenSciEd文件
        openscied_files = list(self.course_library_dir.glob("openscied_*.json"))
        
        for file_path in openscied_files:
            logger.info(f"\n检查文件: {file_path.name}")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    units = json.load(f)
                
                logger.info(f"  单元数量: {len(units)}")
                result["total_units"] += len(units)
                
                # 按年级统计
                for unit in units:
                    grade = unit.get('grade_level', 'unknown')
                    result["by_grade"][grade] = result["by_grade"].get(grade, 0) + 1
                    
                    # 验证必需字段
                    required_fields = ['unit_id', 'title', 'source', 'grade_level', 'subject']
                    missing_fields = [field for field in required_fields if not unit.get(field)]
                    
                    if missing_fields:
                        result["invalid_units"] += 1
                        result["issues"].append({
                            "file": file_path.name,
                            "unit_id": unit.get('unit_id', 'unknown'),
                            "issue": f"缺少字段: {missing_fields}"
                        })
                    else:
                        result["valid_units"] += 1
                
            except Exception as e:
                logger.error(f"  ❌ 读取文件失败: {e}")
                result["issues"].append({
                    "file": file_path.name,
                    "issue": f"读取失败: {str(e)}"
                })
        
        # 输出统计信息
        logger.info(f"\n{'='*60}")
        logger.info(f"OpenSciEd数据验证结果:")
        logger.info(f"  总单元数: {result['total_units']}")
        logger.info(f"  有效单元: {result['valid_units']}")
        logger.info(f"  无效单元: {result['invalid_units']}")
        logger.info(f"  按年级分布: {result['by_grade']}")
        logger.info(f"  问题数量: {len(result['issues'])}")
        
        if result['total_units'] >= 30:
            logger.info(f"  ✅ 满足要求 (≥30个单元)")
        else:
            logger.warning(f"  ⚠️ 未满足要求 (需要≥30个单元，当前{result['total_units']}个)")
        
        logger.info(f"{'='*60}\n")
        
        return result
    
    def validate_openstax_data(self) -> Dict[str, Any]:
        """验证OpenStax数据"""
        logger.info("="*60)
        logger.info("验证OpenStax数据")
        logger.info("="*60)
        
        result = {
            "total_chapters": 0,
            "with_pdf_links": 0,
            "by_subject": {},
            "by_grade": {},
            "valid_chapters": 0,
            "invalid_chapters": 0,
            "issues": []
        }
        
        # 检查OpenStax文件
        openstax_file = self.textbook_library_dir / "openstax_chapters.json"
        
        if not openstax_file.exists():
            logger.error(f"❌ 文件不存在: {openstax_file}")
            return result
        
        try:
            with open(openstax_file, 'r', encoding='utf-8') as f:
                chapters = json.load(f)
            
            logger.info(f"\n检查文件: {openstax_file.name}")
            logger.info(f"  章节数量: {len(chapters)}")
            result["total_chapters"] = len(chapters)
            
            # 验证每个章节
            for chapter in chapters:
                # 统计学科和年级
                subject = chapter.get('subject', 'unknown')
                grade = chapter.get('grade_level', 'unknown')
                result["by_subject"][subject] = result["by_subject"].get(subject, 0) + 1
                result["by_grade"][grade] = result["by_grade"].get(grade, 0) + 1
                
                # 检查PDF链接
                pdf_url = chapter.get('pdf_download_url', '')
                if pdf_url and 'openstax.org' in pdf_url:
                    result["with_pdf_links"] += 1
                
                # 验证必需字段
                required_fields = ['chapter_id', 'title', 'textbook', 'source', 'grade_level', 
                                  'subject', 'chapter_url', 'pdf_download_url']
                missing_fields = [field for field in required_fields if not chapter.get(field)]
                
                if missing_fields:
                    result["invalid_chapters"] += 1
                    result["issues"].append({
                        "chapter_id": chapter.get('chapter_id', 'unknown'),
                        "issue": f"缺少字段: {missing_fields}"
                    })
                else:
                    result["valid_chapters"] += 1
            
        except Exception as e:
            logger.error(f"❌ 读取文件失败: {e}")
            result["issues"].append({
                "file": openstax_file.name,
                "issue": f"读取失败: {str(e)}"
            })
        
        # 输出统计信息
        logger.info(f"\n{'='*60}")
        logger.info(f"OpenStax数据验证结果:")
        logger.info(f"  总章节数: {result['total_chapters']}")
        logger.info(f"  有效章节: {result['valid_chapters']}")
        logger.info(f"  无效章节: {result['invalid_chapters']}")
        logger.info(f"  含PDF链接: {result['with_pdf_links']}")
        logger.info(f"  按学科分布: {result['by_subject']}")
        logger.info(f"  按年级分布: {result['by_grade']}")
        logger.info(f"  问题数量: {len(result['issues'])}")
        
        if result['total_chapters'] >= 50:
            logger.info(f"  ✅ 满足要求 (≥50个章节)")
        else:
            logger.warning(f"  ⚠️ 未满足要求 (需要≥50个章节，当前{result['total_chapters']}个)")
        
        if result['with_pdf_links'] > 0:
            logger.info(f"  ✅ 包含PDF下载链接")
        else:
            logger.warning(f"  ⚠️ 缺少PDF下载链接")
        
        logger.info(f"{'='*60}\n")
        
        return result
    
    def generate_summary_report(self):
        """生成总结报告"""
        logger.info("\n" + "="*60)
        logger.info("数据验证总结报告")
        logger.info("="*60)
        
        openscied_result = self.validate_openscied_data()
        openstax_result = self.validate_openstax_data()
        
        logger.info("\n" + "="*60)
        logger.info("总体评估")
        logger.info("="*60)
        
        # OpenSciEd评估
        if openscied_result['total_units'] >= 30:
            logger.info(f"✅ OpenSciEd: {openscied_result['total_units']}个单元 (要求≥30)")
        else:
            logger.error(f"❌ OpenSciEd: {openscied_result['total_units']}个单元 (要求≥30)")
        
        # OpenStax评估
        if openstax_result['total_chapters'] >= 50:
            logger.info(f"✅ OpenStax: {openstax_result['total_chapters']}个章节 (要求≥50)")
        else:
            logger.error(f"❌ OpenStax: {openstax_result['total_chapters']}个章节 (要求≥50)")
        
        if openstax_result['with_pdf_links'] > 0:
            logger.info(f"✅ OpenStax: 包含PDF下载链接 ({openstax_result['with_pdf_links']}/{openstax_result['total_chapters']})")
        else:
            logger.error(f"❌ OpenStax: 缺少PDF下载链接")
        
        logger.info("="*60 + "\n")
        
        return {
            "openscied": openscied_result,
            "openstax": openstax_result
        }


def main():
    """主函数"""
    validator = DataValidator()
    validator.generate_summary_report()


if __name__ == "__main__":
    main()
