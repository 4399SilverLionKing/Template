from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):

    # 基本信息
    PROJECT_NAME: str = "Langchian+Nacos Template"
    API_V1_STR: str = "/api/v1"

    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]  # 允许的来源，生产环境建议指定具体域名
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]  # 允许的HTTP方法
    CORS_ALLOW_HEADERS: List[str] = ["*"]  # 允许的请求头

# 创建全局配置实例
settings = Settings()