from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import logging
from typing import AsyncGenerator

from app.schemas.chat import (
    ChatRequest,
    StreamChatRequest,
    ChatResponse,
    StreamChunk,
)
from app.agent.graph import agent
from app.agent.state import State

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_router = APIRouter()


@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    与agent进行对话，返回完整响应
    """
    try:
        logger.info(
            f"收到聊天请求 - Session ID: {request.session_id}, Input: {request.input}"
        )

        # 创建初始状态
        initial_state = State(user_message=request.input)

        # 调用agent图执行
        result = agent.invoke(initial_state)

        # 获取最终报告或最后的消息作为响应
        response_content = result.get("final_report", "")
        if not response_content and result.get("messages"):
            # 如果没有最终报告，使用最后一条消息
            last_message = result["messages"][-1]
            response_content = (
                last_message.content
                if hasattr(last_message, "content")
                else str(last_message)
            )

        logger.info(f"Agent执行完成 - Session ID: {request.session_id}")

        return ChatResponse(response=response_content)

    except Exception as e:
        logger.error(f"处理聊天请求时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理请求时出错: {str(e)}")


@api_router.post("/chat/stream")
async def stream_chat_with_agent(request: StreamChatRequest):
    """
    与agent进行流式对话
    """
    try:
        logger.info(
            f"收到流式聊天请求 - Session ID: {request.session_id}, Input: {request.input}"
        )

        async def generate_stream() -> AsyncGenerator[str, None]:
            try:
                # 创建初始状态
                initial_state = State(user_message=request.input)

                # 发送开始事件
                start_chunk = StreamChunk(
                    type="start",
                    content="开始处理您的请求...",
                    metadata={"session_id": request.session_id},
                )
                yield f"data: {start_chunk.model_dump_json()}\n\n"

                # 使用stream方法执行agent图
                async for event in agent.astream(initial_state):
                    # 处理不同类型的事件
                    for node_name, node_output in event.items():
                        if node_name == "planner":
                            # 规划阶段
                            chunk = StreamChunk(
                                type="planning",
                                content="正在制定执行计划...",
                                metadata={"node": node_name},
                            )
                            yield f"data: {chunk.model_dump_json()}\n\n"

                        elif node_name == "agent":
                            # Agent思考阶段
                            chunk = StreamChunk(
                                type="thinking",
                                content="正在分析和思考...",
                                metadata={"node": node_name},
                            )
                            yield f"data: {chunk.model_dump_json()}\n\n"

                        elif node_name == "tool_executor":
                            # 工具执行阶段
                            chunk = StreamChunk(
                                type="tool_execution",
                                content="正在执行工具操作...",
                                metadata={"node": node_name},
                            )
                            yield f"data: {chunk.model_dump_json()}\n\n"

                        elif node_name == "marker":
                            # 标记完成阶段
                            chunk = StreamChunk(
                                type="progress",
                                content="步骤执行完成，继续下一步...",
                                metadata={"node": node_name},
                            )
                            yield f"data: {chunk.model_dump_json()}\n\n"

                        elif node_name == "reporter":
                            # 报告生成阶段
                            final_report = node_output.get("final_report", "")
                            chunk = StreamChunk(
                                type="final",
                                content=final_report,
                                metadata={
                                    "node": node_name,
                                    "session_id": request.session_id,
                                },
                            )
                            yield f"data: {chunk.model_dump_json()}\n\n"

                # 发送结束事件
                end_chunk = StreamChunk(
                    type="end",
                    content="请求处理完成",
                    metadata={"session_id": request.session_id},
                )
                yield f"data: {end_chunk.model_dump_json()}\n\n"

            except Exception as e:
                logger.error(f"流式处理过程中出错: {str(e)}")
                error_chunk = StreamChunk(
                    type="error",
                    content=f"处理过程中出现错误: {str(e)}",
                    metadata={"session_id": request.session_id},
                )
                yield f"data: {error_chunk.model_dump_json()}\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
            },
        )

    except Exception as e:
        logger.error(f"启动流式聊天时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"启动流式聊天时出错: {str(e)}")
