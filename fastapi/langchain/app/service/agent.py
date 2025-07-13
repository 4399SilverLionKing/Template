from langchain import hub
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_tools_agent, AgentExecutor
from app.core.config import settings
from typing import AsyncGenerator

def create_agent_executor():

    # 初始化模型，使用配置中的环境变量
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        base_url=settings.OPENAI_BASE_URL,
        temperature=0.7,
    )

    # 工具
    tools = []

    # 使用标准提示词模板
    prompt = hub.pull("hwchase17/openai-tools-agent")

    # Agent
    agent = create_openai_tools_agent(llm, tools, prompt)

    # 执行器
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    return agent_executor

def create_streaming_agent_executor():
    """创建支持流式响应的agent执行器"""

    # 初始化支持流式的模型
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        base_url=settings.OPENAI_BASE_URL,
        temperature=0.7,
        streaming=True,  # 启用流式响应
    )

    # 工具
    tools = []

    # 使用标准提示词模板
    prompt = hub.pull("hwchase17/openai-tools-agent")

    # Agent
    agent = create_openai_tools_agent(llm, tools, prompt)

    # 执行器
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    return agent_executor

async def stream_agent_response(user_input: str) -> AsyncGenerator[dict, None]:
    """
    流式执行agent并返回响应块
    """
    try:
        # 创建流式agent执行器
        streaming_executor = create_streaming_agent_executor()

        # 在用户输入前添加中文指令
        chinese_prompt = f"请用中文回答以下问题：{user_input},在制定旅行计划之前，你需要调用天气查询工具来查看一路上的天气情况，并结合天气情况给出合理的建议。"

        # 使用astream_events方法进行真正的流式执行
        async for event in streaming_executor.astream_events(
            {"input": chinese_prompt},
            version="v1"
        ):
            kind = event["event"]

            if kind == "on_tool_start":
                # 工具开始调用
                tool_name = event["name"]
                tool_input = event.get("data", {}).get("input", {})
                yield {
                    "type": "tool_call",
                    "content": f"🔧 正在调用工具: {tool_name}",
                    "metadata": {
                        "tool": tool_name,
                        "tool_input": str(tool_input)
                    }
                }

            elif kind == "on_tool_end":
                # 工具调用结束
                tool_name = event["name"]
                output = event.get("data", {}).get("output", "")
                yield {
                    "type": "tool_result",
                    "content": f"✅ 工具 {tool_name} 执行完成",
                    "metadata": {
                        "tool": tool_name,
                        "observation": str(output)
                    }
                }

            elif kind == "on_chat_model_stream":
                # LLM流式输出
                chunk = event.get("data", {}).get("chunk", {})
                if hasattr(chunk, 'content') and getattr(chunk, 'content', None):
                    yield {
                        "type": "token",
                        "content": getattr(chunk, 'content', ''),
                        "metadata": None
                    }

            elif kind == "on_chain_end" and event["name"] == "AgentExecutor":
                # Agent执行完成
                output = event.get("data", {}).get("output", {})
                if isinstance(output, dict) and "output" in output:
                    yield {
                        "type": "final",
                        "content": output["output"],
                        "metadata": None
                    }

    except Exception as e:
        yield {
            "type": "error",
            "content": f"处理请求时发生错误: {str(e)}",
            "metadata": {"error_type": type(e).__name__}
        }

agent_executor_instance = create_agent_executor()
streaming_agent_executor_instance = create_streaming_agent_executor()