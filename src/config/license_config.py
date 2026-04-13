"""
许可证管理系统配置
基于Sentinel社区版的配置设置
"""

from typing import Optional

from pydantic import BaseModel


class RedisConfig(BaseModel):
    """Redis配置"""

    host: str = "localhost"
    port: int = 6379
    db: int = 1
    password: Optional[str] = None
    ssl: bool = False


class LicenseConfig(BaseModel):
    """许可证配置"""

    issuer: str = "iMatuProject"
    audience: str = "enterprise"
    algorithm: str = "HS256"
    expiration_hours: int = 24
    key_length: int = 32
    prefix: str = "LICENSE"


class CacheConfig(BaseModel):
    """缓存配置"""

    ttl_seconds: int = 3600
    cleanup_interval: int = 300


class SentinelConfig(BaseModel):
    """Sentinel主配置"""

    storage: RedisConfig = RedisConfig()
    license: LicenseConfig = LicenseConfig()
    cache: CacheConfig = CacheConfig()


# 默认配置实例
default_sentinel_config = SentinelConfig()


# 从环境变量加载配置的函数
def load_sentinel_config() -> SentinelConfig:
    """从环境变量加载Sentinel配置"""
    import os

    config = SentinelConfig()

    # Redis配置
    config.storage.host = os.getenv("REDIS_HOST", config.storage.host)
    config.storage.port = int(os.getenv("REDIS_PORT", config.storage.port))
    config.storage.db = int(os.getenv("REDIS_DB", config.storage.db))
    config.storage.password = os.getenv("REDIS_PASSWORD", config.storage.password)

    # 许可证配置
    config.license.issuer = os.getenv("LICENSE_ISSUER", config.license.issuer)
    config.license.audience = os.getenv("LICENSE_AUDIENCE", config.license.audience)
    config.license.algorithm = os.getenv("LICENSE_ALGORITHM", config.license.algorithm)
    config.license.expiration_hours = int(
        os.getenv("LICENSE_EXPIRATION_HOURS", config.license.expiration_hours)
    )
    config.license.key_length = int(
        os.getenv("LICENSE_KEY_LENGTH", config.license.key_length)
    )
    config.license.prefix = os.getenv("LICENSE_PREFIX", config.license.prefix)

    # 缓存配置
    config.cache.ttl_seconds = int(
        os.getenv("CACHE_TTL_SECONDS", config.cache.ttl_seconds)
    )
    config.cache.cleanup_interval = int(
        os.getenv("CACHE_CLEANUP_INTERVAL", config.cache.cleanup_interval)
    )

    return config
