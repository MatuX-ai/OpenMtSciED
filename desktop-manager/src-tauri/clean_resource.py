#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
删除 resource.rs 中的旧硬编码数据（457行之后的内容）
"""

from pathlib import Path

def clean_resource_file():
    file_path = Path(__file__).parent / "src" / "commands" / "resource.rs"

    # 读取文件
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 保留前456行（0-455索引）
    cleaned_lines = lines[:456]

    # 添加文件结尾
    cleaned_lines.append("\n")

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)

    print(f"✓ 清理完成！")
    print(f"  原始行数: {len(lines)}")
    print(f"  清理后行数: {len(cleaned_lines)}")
    print(f"  删除行数: {len(lines) - len(cleaned_lines)}")

if __name__ == "__main__":
    clean_resource_file()
