import sqlite3

conn = sqlite3.connect('openmtscied.db')
print('Total courses:', conn.execute('SELECT COUNT(*) FROM courses').fetchone()[0])
print('University courses:', conn.execute("SELECT COUNT(*) FROM courses WHERE level = 'university'").fetchone()[0])
print('Elementary courses:', conn.execute("SELECT COUNT(*) FROM courses WHERE level = 'elementary'").fetchone()[0])
print('Middle courses:', conn.execute("SELECT COUNT(*) FROM courses WHERE level = 'middle'").fetchone()[0])
print('High courses:', conn.execute("SELECT COUNT(*) FROM courses WHERE level = 'high'").fetchone()[0])
