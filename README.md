# MCP-Time 服务器

## 项目介绍
MCP-Time 是一个基于模型上下文协议（Model Context Protocol，简称 MCP）的 Node.js 服务器，专门用于处理时间相关的查询。当大语言模型（如 Claude）在对话中遇到时间相关的问题时，它会调用这个 MCP 服务器来获取准确的时间信息。

## 功能特点
- 获取当前时间（不同时区）
- 获取当前日期
- 计算日期差异
- 格式化时间显示
- 支持世界各地主要时区

## 技术栈
- Node.js
- @modelcontextprotocol/sdk - 官方 MCP SDK
- 其他时间处理库

## 使用方法
1. 安装依赖：`npm install`
2. 启动服务器：`npm start`

## 示例查询
- "现在几点了？"
- "北京时间是几点？"
- "纽约和东京的时差是多少？"
- "三天后是几月几号？"
- "2023年1月1日是星期几？"

## 项目结构
- `index.js` - 主入口文件
- `timeUtils.js` - 时间处理工具函数
- `package.json` - 项目配置和依赖
- `Dockerfile` - Docker 构建配置
- `smithery.yaml` - Smithery.ai 部署配置

## Smithery.ai 部署说明
本项目已配置为可在 Smithery.ai 平台上部署。部署配置包括：

### Dockerfile
使用 Node.js 18 Alpine 镜像构建轻量级容器。

### smithery.yaml
配置文件定义了服务启动方式和配置选项：
- `defaultTimezone`: 可配置默认时区，默认值为 "Asia/Shanghai"

### 部署步骤
1. 在 Smithery.ai 上创建新的 MCP 服务
2. 连接到此 GitHub 仓库
3. 触发部署流程
4. 在配置中设置所需的默认时区

## 开发者
本项目由 Claude 3.7 Sonnet 协助开发 