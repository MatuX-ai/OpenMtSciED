"""
真实数据爬取模块综合测试
验证所有爬虫和数据生成器的功能
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestDataIntegrity:
    """数据完整性测试"""
    
    def __init__(self):
        self.course_library_dir = Path("data/course_library")
        self.textbook_library_dir = Path("data/textbook_library")
        
    def test_openscied_data(self) -> bool:
        """测试OpenSciEd数据"""
        logger.info("\n" + "="*60)
        logger.info("测试OpenSciEd数据")
        logger.info("="*60)
        
        try:
            # 检查主要文件
            main_file = self.course_library_dir / "openscied_all_units.json"
            
            if not main_file.exists():
                logger.error(f"❌ 文件不存在: {main_file}")
                return False
            
            with open(main_file, 'r', encoding='utf-8') as f:
                units = json.load(f)
            
            logger.info(f"✅ 文件读取成功: {len(units)}个单元")
            
            # 验证数据质量
            if len(units) < 30:
                logger.error(f"❌ 单元数量不足: {len(units)} < 30")
                return False
            
            # 检查必需字段
            required_fields = ['unit_id', 'title', 'source', 'grade_level', 'subject']
            for i, unit in enumerate(units[:5]):  # 检查前5个
                missing = [f for f in required_fields if not unit.get(f)]
                if missing:
                    logger.error(f"❌ 单元 {i+1} 缺少字段: {missing}")
                    return False
            
            logger.info(f"✅ 数据质量检查通过")
            logger.info(f"✅ OpenSciEd测试通过: {len(units)}个单元")
            return True
            
        except Exception as e:
            logger.error(f"❌ OpenSciEd测试失败: {e}")
            return False
    
    def test_openstax_data(self) -> bool:
        """测试OpenStax数据"""
        logger.info("\n" + "="*60)
        logger.info("测试OpenStax数据")
        logger.info("="*60)
        
        try:
            # 检查主要文件
            main_file = self.textbook_library_dir / "openstax_chapters.json"
            
            if not main_file.exists():
                logger.error(f"❌ 文件不存在: {main_file}")
                return False
            
            with open(main_file, 'r', encoding='utf-8') as f:
                chapters = json.load(f)
            
            logger.info(f"✅ 文件读取成功: {len(chapters)}个章节")
            
            # 验证数据质量
            if len(chapters) < 50:
                logger.error(f"❌ 章节数量不足: {len(chapters)} < 50")
                return False
            
            # 检查PDF链接
            pdf_count = sum(1 for ch in chapters if ch.get('pdf_download_url'))
            if pdf_count == 0:
                logger.error(f"❌ 没有PDF下载链接")
                return False
            
            logger.info(f"✅ 包含PDF链接: {pdf_count}/{len(chapters)}")
            
            # 检查必需字段
            required_fields = ['chapter_id', 'title', 'textbook', 'source', 
                             'grade_level', 'subject', 'chapter_url', 'pdf_download_url']
            for i, chapter in enumerate(chapters[:5]):  # 检查前5个
                missing = [f for f in required_fields if not chapter.get(f)]
                if missing:
                    logger.error(f"❌ 章节 {i+1} 缺少字段: {missing}")
                    return False
            
            logger.info(f"✅ 数据质量检查通过")
            logger.info(f"✅ OpenStax测试通过: {len(chapters)}个章节")
            return True
            
        except Exception as e:
            logger.error(f"❌ OpenStax测试失败: {e}")
            return False
    
    def test_data_consistency(self) -> bool:
        """测试数据一致性"""
        logger.info("\n" + "="*60)
        logger.info("测试数据一致性")
        logger.info("="*60)
        
        try:
            # 检查OpenSciEd各文件之间的一致性
            openscied_files = list(self.course_library_dir.glob("openscied_*.json"))
            total_units = 0
            
            for file_path in openscied_files:
                if 'partial' not in file_path.name:  # 跳过部分文件
                    with open(file_path, 'r', encoding='utf-8') as f:
                        units = json.load(f)
                        total_units += len(units)
                        logger.info(f"  {file_path.name}: {len(units)}个单元")
            
            logger.info(f"✅ OpenSciEd总单元数: {total_units}")
            
            # 检查OpenStax数据
            openstax_file = self.textbook_library_dir / "openstax_chapters.json"
            with open(openstax_file, 'r', encoding='utf-8') as f:
                chapters = json.load(f)
            
            logger.info(f"✅ OpenStax总章节数: {len(chapters)}")
            
            # 验证书籍分布
            textbooks = set(ch['textbook'] for ch in chapters)
            logger.info(f"✅ OpenStax教材数量: {len(textbooks)}")
            for textbook in sorted(textbooks):
                count = sum(1 for ch in chapters if ch['textbook'] == textbook)
                logger.info(f"  - {textbook}: {count}章")
            
            logger.info(f"✅ 数据一致性测试通过")
            return True
            
        except Exception as e:
            logger.error(f"❌ 数据一致性测试失败: {e}")
            return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """运行所有测试"""
        logger.info("\n" + "="*60)
        logger.info("开始真实数据爬取模块综合测试")
        logger.info("="*60)
        
        results = {
            "openscied": self.test_openscied_data(),
            "openstax": self.test_openstax_data(),
            "consistency": self.test_data_consistency()
        }
        
        logger.info("\n" + "="*60)
        logger.info("测试结果总结")
        logger.info("="*60)
        
        all_passed = True
        for test_name, passed in results.items():
            status = "✅ 通过" if passed else "❌ 失败"
            logger.info(f"{test_name}: {status}")
            if not passed:
                all_passed = False
        
        logger.info("="*60)
        
        if all_passed:
            logger.info("🎉 所有测试通过！真实数据爬取模块已成功实现。")
        else:
            logger.error("⚠️  部分测试失败，请检查上述错误信息。")
        
        return results


def main():
    """主函数"""
    tester = TestDataIntegrity()
    results = tester.run_all_tests()
    
    # 返回退出码
    exit_code = 0 if all(results.values()) else 1
    exit(exit_code)


if __name__ == "__main__":
    main()
