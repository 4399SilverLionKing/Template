from app.tools.systemTool import write_file
from app.tools.weatherTool import get_weather
from app.core.ai_config import ai_settings

from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import create_react_agent

def create_agent_executor():

    # 初始化模型，使用配置中的环境变量
    llm = ChatOpenAI(
        model=ai_settings.OPENAI_MODEL,
        base_url=ai_settings.OPENAI_BASE_URL,
        temperature=0.7,
        streaming=False
    )

    # 工具
    search_tool = TavilySearchResults(max_results=5, topic="general")
    tools = [write_file, get_weather, search_tool]

    # 提示词模板
    prompt =  ChatPromptTemplate.from_messages([
        ("system", "你是一位智能助手"),
        MessagesPlaceholder(variable_name="messages")
    ])
    
    checkpointer = InMemorySaver()

    # 创建可执行的图
    agent_graph = create_react_agent(llm, tools, prompt=prompt, checkpointer=checkpointer)

    return agent_graph

agent = create_agent_executor()
