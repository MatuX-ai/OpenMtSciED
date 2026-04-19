import sys
sys.path.insert(0, 'src')

from config.settings import settings

print(f"DATABASE_URL from settings: {settings.DATABASE_URL}")
print(f"Length: {len(settings.DATABASE_URL)}")
