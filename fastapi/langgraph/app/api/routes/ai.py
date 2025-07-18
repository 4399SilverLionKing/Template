from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from fastapi.langgraph.app.service.react_agent import agent
from langchain_core.messages import HumanMessage
import logging


# 配置日志
logging.basicConfig(level=logging.INFO)

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    if not request.input or not request.input.strip():
        raise HTTPException(status_code=400, detail="请求体中必须包含非空的 'input' 字段")

    try:

        # 调用agent
        result = agent.invoke(
            {"messages": [HumanMessage(request.input)]},
            {"configurable": {"thread_id": request.session_id}}
        )
        
        output = result['messages'][-1].content
        if output is None:
            raise HTTPException(status_code=500, detail="Agent返回了空响应")

        return ChatResponse(response=output)

    except Exception as e:
        # 异常处理
        logging.error(f"调用 Agent 时发生错误: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"处理请求时发生内部错误: {str(e)}")
