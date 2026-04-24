"""
教育平台数据生成器
统一管理多个教育平台的数据采集和导入
支持edX、MIT OpenCourseWare、中国大学MOOC等平台
"""

import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod
import schedule
import time
import threading

# 配置日志（仅在直接运行时配置，避免导入时重复配置）
logger = logging.getLogger(__name__)
if not logger.handlers:
    # 只在没有处理器时才添加，避免重复
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class EducationPlatformGenerator(ABC):
    """教育平台数据生成器基类"""
    
    def __init__(self, platform_name: str):
        self.platform_name = platform_name
        self.data_dir = Path("data/course_library")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
    @abstractmethod
    def generate_courses(self) -> List[Dict[str, Any]]:
        """生成课程数据"""
        pass
    
    @abstractmethod
    def get_schedule_config(self) -> Dict[str, Any]:
        """获取调度配置"""
        pass
    
    def save_to_json(self, courses: List[Dict[str, Any]], filename: str):
        """保存课程数据到JSON文件"""
        output_file = self.data_dir / filename
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(courses, f, ensure_ascii=False, indent=2)
        logger.info(f"✅ {self.platform_name}: 成功保存 {len(courses)} 个课程到 {output_file}")
        return output_file
    
    def run_generation(self):
        """执行数据生成"""
        try:
            logger.info(f"🔄 开始生成 {self.platform_name} 课程数据...")
            courses = self.generate_courses()
            if courses:
                filename = f"{self.platform_name.lower().replace(' ', '_')}_courses.json"
                self.save_to_json(courses, filename)
                logger.info(f"✅ {self.platform_name}: 成功生成 {len(courses)} 个课程")
            else:
                logger.warning(f"⚠️ {self.platform_name}: 未生成任何课程数据")
        except Exception as e:
            logger.error(f"❌ {self.platform_name}: 数据生成失败 - {e}", exc_info=True)


class EdXGenerator(EducationPlatformGenerator):
    """edX平台课程生成器"""
    
    def __init__(self):
        super().__init__("edX")
    
    def generate_courses(self) -> List[Dict[str, Any]]:
        """生成edX课程数据"""
        # 这里应该实现真实的edX API调用或网页爬取
        # 目前返回示例数据
        courses = [
            {
                "course_id": "EDX-CS-001",
                "title": "Introduction to Computer Science",
                "source": "edx",
                "grade_level": "university",
                "subject": "Computer Science",
                "duration_weeks": 12,
                "description": "Learn the basics of computer science and programming.",
                "knowledge_points": [
                    {"kp_id": "KP-EDX-CS-001", "name": "Programming Basics", "description": "Variables, loops, functions"},
                    {"kp_id": "KP-EDX-CS-002", "name": "Data Structures", "description": "Arrays, lists, dictionaries"}
                ],
                "course_url": "https://www.edx.org/course/introduction-to-computer-science",
                "scraped_at": datetime.now().isoformat()
            },
            {
                "course_id": "EDX-MATH-001", 
                "title": "Calculus 1A: Differentiation",
                "source": "edx",
                "grade_level": "university",
                "subject": "Mathematics",
                "duration_weeks": 10,
                "description": "Learn the fundamentals of differential calculus.",
                "knowledge_points": [
                    {"kp_id": "KP-EDX-MATH-001", "name": "Limits", "description": "Understanding limits and continuity"},
                    {"kp_id": "KP-EDX-MATH-002", "name": "Derivatives", "description": "Rules of differentiation"}
                ],
                "course_url": "https://www.edx.org/course/calculus-1a-differentiation",
                "scraped_at": datetime.now().isoformat()
            }
        ]
        return courses
    
    def get_schedule_config(self) -> Dict[str, Any]:
        """edX平台调度配置 - 每周更新一次"""
        return {
            "interval": "weekly",
            "day": "monday",
            "time": "02:00"
        }


class MITOpenCourseWareGenerator(EducationPlatformGenerator):
    """MIT OpenCourseWare课程生成器"""
    
    def __init__(self):
        super().__init__("MIT OpenCourseWare")
    
    def generate_courses(self) -> List[Dict[str, Any]]:
        """生成MIT OCW课程数据"""
        courses = [
            {
                "course_id": "MIT-PHYS-001",
                "title": "Classical Mechanics",
                "source": "mit_ocw",
                "grade_level": "university",
                "subject": "Physics",
                "duration_weeks": 15,
                "description": "Newtonian mechanics, fluid mechanics, and kinetic gas theory.",
                "knowledge_points": [
                    {"kp_id": "KP-MIT-PHYS-001", "name": "Newton's Laws", "description": "Three laws of motion"},
                    {"kp_id": "KP-MIT-PHYS-002", "name": "Conservation Laws", "description": "Energy, momentum, angular momentum"}
                ],
                "course_url": "https://ocw.mit.edu/courses/physics/8-01sc-classical-mechanics-fall-2016/",
                "scraped_at": datetime.now().isoformat()
            },
            {
                "course_id": "MIT-CS-001",
                "title": "Introduction to Algorithms",
                "source": "mit_ocw",
                "grade_level": "university", 
                "subject": "Computer Science",
                "duration_weeks": 14,
                "description": "Mathematical modeling of computational problems.",
                "knowledge_points": [
                    {"kp_id": "KP-MIT-CS-001", "name": "Algorithm Analysis", "description": "Time and space complexity"},
                    {"kp_id": "KP-MIT-CS-002", "name": "Sorting Algorithms", "description": "Merge sort, quicksort, heapsort"}
                ],
                "course_url": "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-006-introduction-to-algorithms-fall-2011/",
                "scraped_at": datetime.now().isoformat()
            }
        ]
        return courses
    
    def get_schedule_config(self) -> Dict[str, Any]:
        """MIT OCW平台调度配置 - 每两周更新一次"""
        return {
            "interval": "biweekly",
            "day": "wednesday", 
            "time": "03:00"
        }


class ChineseMOOCGenerator(EducationPlatformGenerator):
    """中国大学MOOC课程生成器"""
    
    def __init__(self):
        super().__init__("Chinese MOOC")
    
    def generate_courses(self) -> List[Dict[str, Any]]:
        """生成中国大学MOOC课程数据"""
        courses = [
            {
                "course_id": "CMOOC-MATH-001",
                "title": "高等数学",
                "source": "chinese_mooc",
                "grade_level": "university",
                "subject": "数学",
                "duration_weeks": 16,
                "description": "微积分、线性代数、概率论等高等数学基础知识。",
                "knowledge_points": [
                    {"kp_id": "KP-CMOOC-MATH-001", "name": "极限与连续", "description": "函数极限、连续性概念"},
                    {"kp_id": "KP-CMOOC-MATH-002", "name": "导数与微分", "description": "求导法则、微分应用"}
                ],
                "course_url": "https://www.icourse163.org/course/TSINGHUA-1003397001",
                "scraped_at": datetime.now().isoformat()
            },
            {
                "course_id": "CMOOC-PHYS-001",
                "title": "大学物理",
                "source": "chinese_mooc",
                "grade_level": "university",
                "subject": "物理",
                "duration_weeks": 15,
                "description": "力学、热学、电磁学、光学和近代物理基础。",
                "knowledge_points": [
                    {"kp_id": "KP-CMOOC-PHYS-001", "name": "牛顿运动定律", "description": "三大运动定律及应用"},
                    {"kp_id": "KP-CMOOC-PHYS-002", "name": "电磁感应", "description": "法拉第电磁感应定律"}
                ],
                "course_url": "https://www.icourse163.org/course/PKU-1003397002",
                "scraped_at": datetime.now().isoformat()
            }
        ]
        return courses
    
    def get_schedule_config(self) -> Dict[str, Any]:
        """中国大学MOOC平台调度配置 - 每周更新一次"""
        return {
            "interval": "weekly",
            "day": "friday",
            "time": "04:00"
        }


class EducationPlatformManager:
    """教育平台管理器 - 统一管理所有平台的数据生成"""
    
    def __init__(self):
        self.generators: Dict[str, EducationPlatformGenerator] = {}
        self.schedules: Dict[str, Any] = {}
        self._stop_event = threading.Event()
        
        # 注册默认平台
        self.register_generator(EdXGenerator())
        self.register_generator(MITOpenCourseWareGenerator())
        self.register_generator(ChineseMOOCGenerator())
    
    def register_generator(self, generator: EducationPlatformGenerator):
        """注册数据生成器"""
        self.generators[generator.platform_name] = generator
        self.schedules[generator.platform_name] = generator.get_schedule_config()
        logger.info(f"✅ 注册平台: {generator.platform_name}")
    
    def run_all_generators(self):
        """运行所有平台的数据生成"""
        logger.info("🚀 开始运行所有教育平台数据生成器...")
        for name, generator in self.generators.items():
            logger.info(f"📚 处理平台: {name}")
            generator.run_generation()
        logger.info("✅ 所有平台数据生成完成")
    
    def run_specific_generator(self, platform_name: str):
        """运行特定平台的数据生成"""
        if platform_name in self.generators:
            logger.info(f"📚 运行指定平台: {platform_name}")
            self.generators[platform_name].run_generation()
        else:
            logger.error(f"❌ 未找到平台: {platform_name}")
    
    def start_scheduled_tasks(self):
        """启动定时任务"""
        logger.info("⏰ 启动定时任务调度...")
        
        for name, config in self.schedules.items():
            interval = config.get("interval", "daily")
            time_str = config.get("time", "02:00")
            day = config.get("day", "monday")
            
            # 设置调度任务
            if interval == "daily":
                schedule.every().day.at(time_str).do(
                    self.run_specific_generator, platform_name=name
                )
            elif interval == "weekly":
                getattr(schedule.every(), day).at(time_str).do(
                    self.run_specific_generator, platform_name=name
                )
            elif interval == "biweekly":
                # 每两周执行一次
                getattr(schedule.every(), day).at(time_str).do(
                    self.run_specific_generator, platform_name=name
                )
            
            logger.info(f"⏰ 设置 {name} 定时任务: {interval} {day} {time_str}")
        
        # 在后台线程中运行调度器
        def run_scheduler():
            while not self._stop_event.is_set():
                schedule.run_pending()
                time.sleep(60)  # 每分钟检查一次
        
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        logger.info("✅ 定时任务调度器已启动")
    
    def stop_scheduled_tasks(self):
        """停止定时任务"""
        self._stop_event.set()
        schedule.clear()
        logger.info("🛑 定时任务调度器已停止")
    
    def get_platform_status(self) -> Dict[str, Any]:
        """获取所有平台的状态信息"""
        status = {}
        for name, generator in self.generators.items():
            data_file = self.generators[name].data_dir / f"{name.lower().replace(' ', '_')}_courses.json"
            status[name] = {
                "registered": True,
                "schedule": self.schedules[name],
                "data_file_exists": data_file.exists(),
                "last_updated": None
            }
            
            if data_file.exists():
                stat = data_file.stat()
                status[name]["last_updated"] = datetime.fromtimestamp(stat.st_mtime).isoformat()
                status[name]["file_size"] = stat.st_size
        
        return status


# 全局管理器实例
platform_manager = EducationPlatformManager()


def main():
    """主函数 - 用于测试"""
    logger.info("="*60)
    logger.info("教育平台数据生成器启动")
    logger.info("="*60)
    
    # 立即运行所有生成器
    platform_manager.run_all_generators()
    
    # 显示平台状态
    status = platform_manager.get_platform_status()
    logger.info("\n平台状态:")
    for name, info in status.items():
        logger.info(f"  {name}: {info}")
    
    # 启动定时任务（可选）
    # platform_manager.start_scheduled_tasks()
    
    logger.info("="*60)
    logger.info("教育平台数据生成器运行完成")
    logger.info("="*60)


if __name__ == "__main__":
    main()