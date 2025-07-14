from langchain_core.tools import tool
from pydantic import BaseModel, Field

class Write_Query(BaseModel):
    loc: str = Field(description="需要查询天气的地点")

@tool(args_schema = Write_Query)
def get_weather(loc: str) -> str:
    """
    查询指定地点的天气。
    :param loc: 必要参数，字符串类型，用于表示需要查询天气的地点。
    :return：天气的查询结果
    """
    return "气温40°，湿度60%"