from dotenv import load_dotenv
import os

load_dotenv()
url = os.getenv('DATABASE_URL')
print(f'Length: {len(url)}')
print(f'URL bytes: {url.encode("utf-8")}')
print(f'Byte at position 80: {url.encode("utf-8")[80] if len(url.encode("utf-8")) > 80 else "N/A"}')
print(f'URL: {url}')
