import os
import json

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
COURSE_LIBRARY_DIR = os.path.join(DATA_DIR, "course_library")

def load_json_files(directory: str):
    """加载目录下所有JSON文件"""
    all_data = []
    if not os.path.exists(directory):
        print(f"Directory does not exist: {directory}")
        return all_data
    
    print(f"Loading files from: {directory}")
    print(f"Files in directory: {os.listdir(directory)[:5]}")  # Show first 5 files
    
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        # 添加来源文件名
                        for item in data:
                            item['_source_file'] = filename
                        all_data.extend(data)
                        print(f"Loaded {len(data)} items from {filename}")
                    elif isinstance(data, dict):
                        data['_source_file'] = filename
                        all_data.append(data)
                        print(f"Loaded 1 item from {filename}")
            except Exception as e:
                print(f"Failed to load file {filename}: {e}")
    
    print(f"Total loaded items: {len(all_data)}")
    return all_data

if __name__ == "__main__":
    courses = load_json_files(COURSE_LIBRARY_DIR)
    print(f"Final count: {len(courses)}")
    if courses:
        print(f"Sample course keys: {list(courses[0].keys())[:10]}")