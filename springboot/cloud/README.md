# Spring Cloud 微服务模板项目

## 📋 项目概述

这是一个基于 Spring Cloud 和 Spring Cloud Alibaba 的微服务架构模板项目，提供了完整的微服务开发框架，包括服务注册发现、配置管理、API 网关、认证授权等核心功能。

## 🏗️ 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   移动端应用     │    │   第三方系统     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │  ← 统一入口、路由、认证
                    │   (网关服务)     │
                    └─────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
        ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
        │ Auth Service │  │ 业务服务 A   │  │ 业务服务 B   │
        │ (认证服务)   │  │             │  │             │
        └─────────────┘  └─────────────┘  └─────────────┘
                 │               │               │
                 └───────────────┼───────────────┘
                                 │
                    ┌─────────────────┐
                    │ Nacos Registry  │  ← 服务注册发现
                    │ Nacos Config    │  ← 配置管理
                    └─────────────────┘
```

## 🛠️ 技术栈

### 核心框架
- **Spring Boot**: 3.3.13
- **Spring Cloud**: 2023.0.3
- **Spring Cloud Alibaba**: 2023.0.3.3
- **Java**: 17

### 微服务组件
- **Nacos**: 服务注册发现 & 配置管理
- **Spring Cloud Gateway**: API 网关
- **Spring Security**: 安全框架
- **JWT**: 无状态认证

### 数据层
- **MyBatis-Plus**: 3.5.12 (ORM 框架)
- **MySQL**: 数据库
- **Druid**: 1.2.24 (连接池)

### 工具库
- **Lombok**: 简化代码
- **MapStruct**: 1.6.3 (对象映射)
- **Hutool**: 5.8.26 (工具库)

## 📁 模块结构

```
cloud/
├── common/                 # 公共模块
│   ├── configs/           # 通用配置
│   ├── utils/             # 工具类
│   └── components/        # 通用组件
├── domain/                # 领域模型模块
│   ├── po/               # 持久化对象
│   ├── vo/               # 视图对象
│   └── query/            # 查询对象
├── gateway/               # API 网关
│   ├── config/           # 网关配置
│   └── filter/           # 网关过滤器
├── services/              # 业务服务模块
│   └── service-auth/     # 认证服务
│       ├── config/       # 认证配置
│       ├── controller/   # 控制器
│       ├── service/      # 业务逻辑
│       └── mapper/       # 数据访问
└── pom.xml               # 父级 POM 配置
```

### 模块详细说明

#### 1. Common 模块 (`common/`)
- **MyBatisConfig**: MyBatis-Plus 配置，包含分页插件和自动填充
- **MappingHelper**: MapStruct 映射辅助类

#### 2. Domain 模块 (`domain/`)
- **User**: 用户实体类
- **JsonVO**: 统一响应包装类
- **ResultStatus**: 响应状态枚举
- **LoginQuery/RegisterQuery**: 认证相关查询对象
- **LoginVO**: 登录响应对象

#### 3. Gateway 模块 (`gateway/`)
- **SecurityConfig**: WebFlux 安全配置
- **AuthFilter**: JWT 认证过滤器
- **路由配置**: 支持负载均衡的服务路由

#### 4. Service-Auth 模块 (`services/service-auth/`)
- **用户认证和注册功能**
- **JWT 令牌管理**

## 🚀 快速开始

### 环境要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Nacos 2.x

### 1. 环境准备

#### 启动 Nacos
```bash
# 下载 Nacos
wget https://github.com/alibaba/nacos/releases/download/2.3.0/nacos-server-2.3.0.tar.gz

# 解压并启动
tar -xzf nacos-server-2.3.0.tar.gz
cd nacos/bin
./startup.sh -m standalone
```

访问 Nacos 控制台: http://localhost:8848/nacos (用户名/密码: nacos/nacos)

#### 数据库准备
```sql
-- 创建数据库
CREATE DATABASE cloud_template DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 用户表
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 配置 Nacos

在 Nacos 控制台创建以下配置文件：

#### system.yml (Data ID: system.yml)
```yaml
# 服务名称配置
sn:
  gateway: GATEWAY
  auth: AUTH

# 服务端口配置  
sp:
  gateway: 8080
  auth: 4444

# JWT 配置
jwt:
  secret: bXlTZWNyZXRLZXlGb3JKV1RUb2tlbkdlbmVyYXRpb25BbmRWYWxpZGF0aW9u
  expiration: 86400000  # 24小时
```

#### datasource.yml (Data ID: datasource.yml)
```yaml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/cloud_template?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
    username: root
    password: your_password
    druid:
      initial-size: 5
      min-idle: 5
      max-active: 20
      max-wait: 60000
      validation-query: SELECT 1
```

### 3. 编译和启动

```bash
# 编译项目
mvn clean compile

# 启动认证服务
cd services/service-auth
mvn spring-boot:run

# 启动网关服务
cd ../../gateway  
mvn spring-boot:run
```

## 📡 API 接口

### 认证服务 (端口: 4444)

#### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "role": "USER"
}
```

#### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

响应示例:
```json
{
    "code": 10000,
    "message": "操作成功",
    "data": {
        "username": "testuser",
        "token": "eyJhbGciOiJIUzI1NiJ9..."
    }
}
```

### 网关服务 (端口: 8080)

所有请求通过网关路由到对应服务:
- `/auth/**` → 认证服务
- 其他路径需要 JWT 认证

## 🔧 开发指南

### 添加新的微服务

1. 在 `services/` 目录下创建新服务模块
2. 继承 `services` 父 POM
3. 添加必要依赖 (common, domain)
4. 配置服务注册发现
5. 在网关中添加路由规则

### 扩展认证功能

- 实现 `UserDetailsService` 自定义用户加载逻辑
- 扩展 `JwtUtil` 添加更多 JWT 功能
- 自定义 `AuthenticationProvider` 支持多种认证方式

## 🐳 Docker 部署

项目已配置 Docker Maven 插件，支持容器化部署:

```bash
# 构建 Docker 镜像
mvn docker:build

# 运行容器
mvn docker:run
```

## ⚠️ 注意事项

1. **配置修改**: 修改 `application.yml` 中的 Nacos 服务器地址
2. **数据库配置**: 更新 Nacos 中的数据库连接信息
3. **JWT 密钥**: 生产环境请更换 JWT 签名密钥
4. **Docker 配置**: 修改 `service-auth/pom.xml` 中的 Docker 远程地址

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个模板项目。

## 📄 许可证

本项目采用 Apache License 2.0 许可证。

---

**作者**: asta  
**组织**: HDU  
**版本**: 0.0.1-SNAPSHOT
