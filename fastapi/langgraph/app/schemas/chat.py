from pydantic import BaseModel
from typing import Optional

# 定义请求模型
class ChatRequest(BaseModel):
    session_id: str
    input: str

# 定义流式请求模型
class StreamChatRequest(BaseModel):
    session_id: str
    input: str

# 定义响应模型
class ChatResponse(BaseModel):
    response: str

# 定义流式响应数据模型
class StreamChunk(BaseModel):
    type: str  # "token", "tool_call", "tool_result", "final"
    content: str
    metadata: Optional[dict] = None

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None