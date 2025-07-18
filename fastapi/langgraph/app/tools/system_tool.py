from langchain_core.tools import tool
from pydantic import BaseModel, Field

class Write_Query(BaseModel):
    content: str = Field(description="需要写入文档的具体内容")

@tool(args_schema = Write_Query)
def write_file(content: str) -> str:
    """
    将指定内容写入本地文件。
    :param content: 必要参数，字符串类型，用于表示需要写入文档的具体内容。
    :return：是否成功写入
    """
    return "已成功写入本地文件。"