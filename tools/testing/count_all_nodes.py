import json
import os
from pathlib import Path

def count_nodes_in_file(file_path):
    """统计单个文件中的节点数量"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, list):
            # 如果是列表，每个元素可能是一个单元/章节
            units = len(data)
            knowledge_points = sum(len(unit.get('knowledge_points', [])) for unit in data if isinstance(unit, dict))
            return units, knowledge_points
        elif isinstance(data, dict):
            # 如果是字典，检查是否有特定的键
            if 'units' in data:
                units = len(data['units'])
                knowledge_points = sum(len(unit.get('knowledge_points', [])) for unit in data['units'] if isinstance(unit, dict))
                return units, knowledge_points
            elif 'chapters' in data:
                chapters = len(data['chapters'])
                return chapters, 0
            else:
                return 1, 0  # 假设整个字典是一个节点
        else:
            return 0, 0
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0, 0

def main():
    course_library_dir = Path("data/course_library")
    textbook_library_dir = Path("data/textbook_library")
    
    total_units = 0
    total_knowledge_points = 0
    total_chapters = 0
    
    print("=== 课程库统计 ===")
    for file_path in course_library_dir.glob("*.json"):
        units, kps = count_nodes_in_file(file_path)
        print(f"{file_path.name}: {units} 个单元, {kps} 个知识点")
        total_units += units
        total_knowledge_points += kps
    
    print(f"\n课程库总计: {total_units} 个单元, {total_knowledge_points} 个知识点")
    
    print("\n=== 教材库统计 ===")
    for file_path in textbook_library_dir.glob("*.json"):
        chapters, _ = count_nodes_in_file(file_path)
        print(f"{file_path.name}: {chapters} 个章节")
        total_chapters += chapters
    
    print(f"\n教材库总计: {total_chapters} 个章节")
    
    print(f"\n=== 总体统计 ===")
    print(f"总单元数: {total_units}")
    print(f"总知识点数: {total_knowledge_points}")
    print(f"总章节数: {total_chapters}")
    print(f"总节点数估算: {total_units + total_knowledge_points + total_chapters}")

if __name__ == "__main__":
    main()