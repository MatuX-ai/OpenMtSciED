import sqlite3
import os

db_path = 'src-tauri/data/resources.db'

if not os.path.exists(db_path):
    print(f"数据库文件不存在: {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 检查资源总数
cursor.execute('SELECT COUNT(*) FROM open_resources')
count = cursor.fetchone()[0]
print(f'资源总数: {count}')

# 显示前5条记录
cursor.execute('SELECT id, title, subject FROM open_resources LIMIT 5')
rows = cursor.fetchall()
print('\n前5条记录:')
for row in rows:
    print(f'  ID: {row[0]}')
    print(f'  标题: {row[1]}')
    print(f'  学科: {row[2]}')
    print()

# 检查标签数量
cursor.execute('SELECT COUNT(*) FROM resource_tags')
tag_count = cursor.fetchone()[0]
print(f'标签总数: {tag_count}')

conn.close()
