import sqlite3

db_path = r'C:\Users\Administrator\AppData\Roaming\com.openmtscied.desktop-manager\openmtscied.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 检查所有资源ID
cursor.execute('SELECT id, title FROM open_resources ORDER BY id')
rows = cursor.fetchall()

print(f'数据库中的资源总数: {len(rows)}\n')
for row in rows:
    print(f'{row[0]}: {row[1]}')

conn.close()
