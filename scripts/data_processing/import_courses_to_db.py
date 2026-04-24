import json
import os
import sys
from pathlib import Path

# 添加项目根目录到路径以便导入模型
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

# 加载 .env.local 环境变量
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

from openmtscied.models.db_models import Course, init_db, SessionLocal

DATA_DIR = Path("data/course_library")

def classify_level(filename: str) -> str:
    fname = filename.lower()
    if 'elementary' in fname or 'primary' in fname:
        return 'elementary'
    elif 'middle' in fname or 'junior' in fname:
        return 'middle'
    elif 'high' in fname or 'senior' in fname:
        return 'high'
    elif any(k in fname for k in ['mit', 'coursera', 'edx', 'mooc', 'university', 'college', 'ros']):
        return 'university'
    else:
        return 'high'  # 默认归为高中/综合

def import_courses():
    print("正在初始化数据库...")
    init_db()
    
    db = SessionLocal()
    total_imported = 0
    
    try:
        for json_file in DATA_DIR.glob("*.json"):
            print(f"处理文件: {json_file.name} ...")
            level = classify_level(json_file.name)
            
            with open(json_file, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    if not isinstance(data, list):
                        continue
                    
                    for item in data:
                        # 简单的字段映射，根据实际 JSON 结构调整
                        raw_id = item.get('course_id') or item.get('id')
                        if not raw_id:
                            continue
                        
                        # 生成唯一的数字 ID（使用哈希值的前10位）
                        import hashlib
                        numeric_id = int(hashlib.md5(str(raw_id).encode()).hexdigest()[:10], 16)

                        course = Course(
                            id=numeric_id,
                            title=item.get('title', 'Unknown'),
                            source=item.get('source', json_file.stem),
                            level=level,
                            subject=item.get('subject', 'General'),
                            description=str(item.get('description', ''))[:500],
                            url=item.get('url', ''),
                            metadata_json=item
                        )
                        db.add(course)
                        total_imported += 1
                        
                        # 每 100 条提交一次
                        if total_imported % 100 == 0:
                            try:
                                db.commit()
                                print(f"  已处理 {total_imported} 条...")
                            except Exception as e:
                                print(f"  提交批次出错: {e}")
                                db.rollback()
                
                except Exception as e:
                    print(f"解析 {json_file.name} 出错: {e}")
        
        db.commit()
        print(f"✅ 成功导入 {total_imported} 门课程到数据库。")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 导入失败: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_courses()
