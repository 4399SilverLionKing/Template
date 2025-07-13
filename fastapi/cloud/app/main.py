from dotenv import load_dotenv
load_dotenv()

import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.route import api_router
from app.core.global_config import settings
from app.core.nacos_config import init_clients, load_config, setup_config_watcher, register_service, deregister_service, shutdown_clients


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - 启动时的操作
    try:
        await init_clients()
        await load_config()
        await setup_config_watcher()
        await register_service()
    except Exception as e:
        print(f"启动时初始化 Nacos 失败: {e}")

    yield

    # Shutdown - 关闭时的操作
    try:
        await deregister_service()
        await shutdown_clients()
    except Exception as e:
        print(f"关闭时清理 Nacos 失败: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=20001)
