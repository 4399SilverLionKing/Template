from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.route import api_router
from app.core.global_config import global_settings
import uvicorn

app = FastAPI(
    title=global_settings.PROJECT_NAME
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods="*",
    allow_headers="*",
)

app.include_router(api_router)

if(__name__ == "__main__"):
    uvicorn.run(app, host="127.0.0.1", port=8000)
