from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 智谱API配置
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://open.bigmodel.cn/api/paas/v4/"
    OPENAI_MODEL: str = "glm-4-plus"

# 创建全局配置实例
settings = Settings()