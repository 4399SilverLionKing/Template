import json
import logging
from v2.nacos import NacosNamingService, NacosConfigService, ClientConfigBuilder, RegisterInstanceParam, DeregisterInstanceParam, ConfigParam

# --- Nacos 服务器配置 ---
NACOS_SERVER_ADDRESS = "http://192.168.12.128:8848"
NAMESPACE = "template"
DATA_ID = "fastapi.json"
GROUP = "PYTHON_GROUP"

# --- 全局变量，用于存储从 Nacos 获取的配置 ---
APP_CONFIG = {}

# --- 服务注册信息 ---
SERVICE_NAME = "AI"
SERVICE_IP = "0.0.0.0"
SERVICE_PORT = 20001

# --- 全局客户端实例 ---
config_client = None
naming_client = None

# --- 初始化 Nacos 客户端配置 ---
client_config = (ClientConfigBuilder()
                 .server_address(NACOS_SERVER_ADDRESS)
                 .namespace_id(NAMESPACE)
                 .log_level('INFO')
                 .build())

async def init_clients():
    """
    初始化 Nacos 客户端
    """
    global config_client, naming_client
    try:
        config_client = await NacosConfigService.create_config_service(client_config)
        naming_client = await NacosNamingService.create_naming_service(client_config)
        logging.info("Nacos 客户端初始化成功")
    except Exception as e:
        logging.error("Nacos 客户端初始化失败: %s", e)
        raise

async def load_config():
    """
    从 Nacos 获取配置并加载到全局变量 APP_CONFIG 中
    """
    global APP_CONFIG, config_client
    if config_client is None:
        await init_clients()

    try:
        config_str = await config_client.get_config(ConfigParam( # type: ignore
            data_id=DATA_ID,
            group=GROUP
        ))
        if config_str:
            APP_CONFIG = json.loads(config_str)
            logging.info("成功从 Nacos 加载配置: %s", APP_CONFIG)
        else:
            logging.warning("从 Nacos 未获取到配置信息，请检查配置是否存在。")

    except Exception as e:
        logging.error("从 Nacos 加载配置失败: %s", e)

async def config_listener(tenant, data_id, group, content):
    """
    配置变更的监听回调函数
    当 Nacos 中的配置发生变化时，此函数会被调用
    """
    global APP_CONFIG
    print(f"配置发生变更，tenant:{tenant} data_id:{data_id} group:{group} content:{content}")
    try:
        APP_CONFIG = json.loads(content)
        logging.info("配置已动态更新: %s", APP_CONFIG)
    except Exception as e:
        logging.error("更新配置时解析失败: %s", e)

async def setup_config_watcher():
    """
    添加配置监听器
    """
    global config_client
    if config_client is None:
        await init_clients()

    try:
        await config_client.add_listener(DATA_ID, GROUP, config_listener) # type: ignore
        logging.info("配置监听器添加成功")
    except Exception as e:
        logging.error("添加配置监听器失败: %s", e)
    
async def register_service():
    """
    将当前服务注册到 Nacos
    """
    global naming_client
    if naming_client is None:
        await init_clients()

    try:
        response = await naming_client.register_instance( # type: ignore
            request=RegisterInstanceParam(
                service_name=SERVICE_NAME,
                group_name="DEFAULT_GROUP",
                ip=SERVICE_IP,
                port=SERVICE_PORT,
                weight=1.0,
                cluster_name="DEFAULT",
                metadata={},
                enabled=True,
                healthy=True,
                ephemeral=True  # 设为 True 表示为临时实例，客户端会发送心跳，如果断开连接，实例会被自动移除
            )
        )
        logging.info(
            "服务注册成功: name=%s, ip=%s, port=%s",
            SERVICE_NAME, SERVICE_IP, SERVICE_PORT
        )
    except Exception as e:
        logging.error("服务注册失败: %s", e)

async def deregister_service():
    """
    将当前服务从 Nacos 注销
    """
    global naming_client
    if naming_client is None:
        await init_clients()

    try:
        response = await naming_client.deregister_instance( # type: ignore
            request=DeregisterInstanceParam(
                service_name=SERVICE_NAME,
                group_name="DEFAULT_GROUP",
                ip=SERVICE_IP,
                port=SERVICE_PORT,
                cluster_name="DEFAULT",
                ephemeral=True
            )
        )
        logging.info("服务已成功注销。")
    except Exception as e:
        logging.error("服务注销失败: %s", e)

async def shutdown_clients():
    """
    关闭 Nacos 客户端
    """
    global config_client, naming_client
    try:
        if config_client:
            await config_client.shutdown()
        if naming_client:
            await naming_client.shutdown()
        logging.info("Nacos 客户端已关闭")
    except Exception as e:
        logging.error("关闭 Nacos 客户端失败: %s", e)