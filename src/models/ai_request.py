"""
AI请求记录模型
"""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from utils.database import Base


class AIRequest(Base):
    __tablename__ = "ai_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text)
    model_provider = Column(String(50), nullable=False)  # OpenAI, Lingma, DeepSeek等
    model_name = Column(String(100), nullable=False)
    tokens_used = Column(Integer, default=0)
    processing_time = Column(Float)  # 处理时间（秒）
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "prompt": self.prompt,
            "response": self.response,
            "model_provider": self.model_provider,
            "model_name": self.model_name,
            "tokens_used": self.tokens_used,
            "processing_time": self.processing_time,
            "success": self.success,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
