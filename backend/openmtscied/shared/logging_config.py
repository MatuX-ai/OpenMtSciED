"""
结构化日志配置模块
支持 JSON 格式输出，便于日志聚合和分析
"""

import logging
import sys
import os
from pythonjsonlogger import jsonlogger
from datetime import datetime


def setup_logging(log_level: str = None):
    """
    配置结构化日志
    
    Args:
        log_level: 日志级别 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # 从环境变量读取日志级别
    if log_level is None:
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # 创建根 logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level))
    
    # 清除现有 handlers
    logger.handlers.clear()
    
    # 创建 JSON formatter
    json_formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%dT%H:%M:%S',
        rename_fields={
            'asctime': 'timestamp',
            'name': 'logger',
            'levelname': 'level'
        }
    )
    
    # 控制台 handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(json_formatter)
    logger.addHandler(console_handler)
    
    # 文件 handler（如果指定了日志目录）
    log_dir = os.getenv("LOG_DIR", "logs")
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
    
    if log_dir:
        # 应用日志文件
        app_log_file = os.path.join(log_dir, f"app_{datetime.now().strftime('%Y%m%d')}.log")
        file_handler = logging.FileHandler(app_log_file, encoding='utf-8')
        file_handler.setFormatter(json_formatter)
        logger.addHandler(file_handler)
        
        # 错误日志文件
        error_log_file = os.path.join(log_dir, f"error_{datetime.now().strftime('%Y%m%d')}.log")
        error_handler = logging.FileHandler(error_log_file, encoding='utf-8')
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(json_formatter)
        logger.addHandler(error_handler)
    
    # 抑制第三方库的过多日志
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    return logger


def get_logger(name: str = None) -> logging.Logger:
    """
    获取 logger 实例
    
    Args:
        name: logger 名称
        
    Returns:
        Logger 实例
    """
    if name:
        return logging.getLogger(name)
    return logging.getLogger()


# 导出便捷函数
__all__ = ['setup_logging', 'get_logger']
