from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):

    # 基本信息
    PROJECT_NAME: str = "Langchian Template"
    API_V1_STR: str = "/api/v1"

    # Langchain配置
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGCHAIN_API_KEY: str = "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"
    LANGCHAIN_PROJECT: str = "ChinaTravel"

    # 智谱API配置
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://open.bigmodel.cn/api/paas/v4/"
    OPENAI_MODEL: str = "glm-4-plus"

    # Redis配置
    REDIS_HOST: str = "192.168.12.128"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 3
    REDIS_PASSWORD: str = "123456"
    REDIS_DECODE_RESPONSES: bool = True

    # 对话配置
    CONVERSATION_TTL: int = 86400
    MAX_CONVERSATION_HISTORY: int = 50

    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]  # 允许的来源，生产环境建议指定具体域名
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]  # 允许的HTTP方法
    CORS_ALLOW_HEADERS: List[str] = ["*"]  # 允许的请求头

    class Config:
        env_file = ".env"

# 创建全局配置实例
settings = Settings()