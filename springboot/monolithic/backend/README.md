# backend

这是一个基于 Spring Boot 3 构建的现代化后端项目。

## 项目简介

本项目是一个功能完备的后端服务，采用了当前主流的技术栈，旨在提供高性能、高安全性和高开发效率的解决方案。项目已经为容器化部署做好了配置，可以方便地通过 Docker进行一键部署。

## 技术架构

项目的核心技术栈如下：

| 分类             | 技术                  | 描述                                                         |
| :--------------- | :-------------------- | :----------------------------------------------------------- |
| **核心框架**     | Spring Boot 3.5.3     | 业界领先的应用开发框架，简化了 Spring 应用的搭建和开发过程。 |
| **编程语言**     | Java 17               | 长期支持（LTS）版本的 Java，性能优越，语法现代。             |
| **Web 框架**     | Spring MVC            | 用于构建 RESTful API。                                       |
| **安全框架**     | Spring Security + JWT | 提供企业级的认证与授权，使用 JWT 实现无状态认证。            |
| **持久层框架**   | MyBatis-Plus          | 高效的 ORM 框架，简化了数据库操作。                          |
| **数据库**       | MySQL                 | 成熟可靠的关系型数据库。                                     |
| **数据库连接池** | Druid                 | 阿里巴巴开源的高性能数据库连接池，提供强大的监控功能。       |
| **缓存**         | Redis                 | 高性能的内存数据库，用于数据缓存，提升系统性能。             |
| **开发工具**     | Lombok, MapStruct     | Lombok 简化了 Java Bean 的编写，MapStruct 用于高效的对象映射。 |
| **运维监控**     | Spring Boot Actuator  | 提供生产级的应用监控和管理端点。                             |
| **构建与部署**   | Maven, Docker         | 使用 Maven 进行项目构建，并通过 `docker-maven-plugin` 实现容器化部署。 |

## 环境要求

在本地运行或构建此项目，您需要安装以下环境：

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis
- Docker (用于容器化部署)

## 快速开始

1.  **克隆项目**
    ```bash
    git clone <your-repository-url>
    cd backend
    ```

2.  **配置环境**
    修改 `src/main/resources/application.yml` 文件，配置您的数据库和 Redis 连接信息。
    
    ```yaml
    spring:
      datasource:
        druid:
          url: jdbc:mysql://localhost:3306/your_db?serverTimezone=UTC
          username: your_username
          password: your_password
      data:
        redis:
          host: localhost
          port: 6379
          password: your_redis_password # 如果没有密码，请移除此行
    ```
    
3.  **构建项目**
    ```bash
    mvn clean install
    ```

4.  **运行项目**
    ```bash
    mvn spring-boot:run
    ```
    或者直接运行打包好的 jar 文件：
    ```bash
    java -jar target/backend-0.0.1-SNAPSHOT.jar
    ```
    服务启动后，将监听 `4444` 端口（根据您的配置文件）。

## 部署

本项目已配置 `docker-maven-plugin`，支持通过 Maven 命令进行 Docker 镜像的构建和部署。

**注意**: 在执行 Docker 相关命令前，请确保您的 `pom.xml` 中 `docker-maven-plugin` 的配置是正确的。

- `<dockerHost>`: 您的远程 Docker 服务地址。
- `<certPath>`: 连接远程 Docker 服务所需的 CA 证书路径。

请将项目中的 `TODO` 标记处替换为您的实际配置。

1.  **构建 Docker 镜像**
    
    ```bash
    mvn docker:build
    ```
    
2.  **启动 Docker 容器**
    此命令会根据 `pom.xml` 中的 `<run>` 配置来启动容器。
    ```bash
    mvn docker:start
    ```

3.  **停止 Docker 容器**
    ```bash
    mvn docker:stop
    ```

4.  **构建并推送镜像（如果配置了 registry）**
    ```bash
    mvn deploy
    ```
