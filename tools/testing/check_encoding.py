import os
import sys

print("=== System Encoding ===")
print(f"Default encoding: {sys.getdefaultencoding()}")
print(f"File system encoding: {sys.getfilesystemencoding()}")
print(f"Stdout encoding: {sys.stdout.encoding}")

print("\n=== Environment Variables with Non-ASCII ===")
for key, value in os.environ.items():
    try:
        value.encode('ascii')
    except UnicodeEncodeError:
        print(f"{key}: {value}")
        print(f"  Bytes: {value.encode('utf-8')}")

print("\n=== Checking PATH and other common vars ===")
for var in ['PATH', 'USERPROFILE', 'TEMP', 'TMP']:
    if var in os.environ:
        val = os.environ[var]
        print(f"{var}: {val[:100]}...")
