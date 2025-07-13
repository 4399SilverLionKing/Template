from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest, ChatResponse, StreamChatRequest, StreamChunk
from app.service.agent import agent_executor_instance, stream_agent_response
import logging
import json

# 配置日志
logging.basicConfig(level=logging.INFO)

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    智能助手聊天接口

    - input: 用户输入的问题或请求
    """

    if not request.input or not request.input.strip():
        raise HTTPException(status_code=400, detail="请求体中必须包含非空的 'input' 字段")

    try:
        # 在用户输入前添加中文指令
        chinese_prompt = f"请用中文回答以下问题：{request.input}"

        # 调用agent
        result = agent_executor_instance.invoke({
            "input": chinese_prompt
        })

        # 获取输出
        output = result.get("output")

        if output is None:
            raise HTTPException(status_code=500, detail="Agent返回了空响应")

        return ChatResponse(response=output)

    except Exception as e:
        # 异常处理
        logging.error(f"调用 Agent 时发生错误: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"处理请求时发生内部错误: {str(e)}")


@router.post("/chat/stream")
async def stream_chat(request: StreamChatRequest):
    """
    智能助手流式聊天接口

    - input: 用户输入的问题或请求
    - session_id: 会话ID

    返回Server-Sent Events (SSE)格式的流式响应
    """

    if not request.input or not request.input.strip():
        raise HTTPException(status_code=400, detail="请求体中必须包含非空的 'input' 字段")

    async def generate_stream():
        """生成SSE格式的流式响应"""
        try:
            async for chunk in stream_agent_response(request.input):
                # 将chunk转换为StreamChunk模型
                stream_chunk = StreamChunk(
                    type=chunk["type"],
                    content=chunk["content"],
                    metadata=chunk.get("metadata")
                )

                # 转换为SSE格式
                data = stream_chunk.model_dump_json()
                yield f"data: {data}\n\n"

        except Exception as e:
            # 发送错误信息
            error_chunk = StreamChunk(
                type="error",
                content=f"流式响应发生错误: {str(e)}",
                metadata={"error_type": type(e).__name__}
            )
            yield f"data: {error_chunk.model_dump_json()}\n\n"

        # 发送结束标记
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/plain; charset=utf-8"
        }
    )