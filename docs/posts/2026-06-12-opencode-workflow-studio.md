---
title: "opencode Workflow Studio: 多Agent协作可视化平台"
date: 2026-06-12
author: mu8429
tags: [AI, 工作流, opencode, 可视化]
categories: [技术分享]
description: 一个基于Web的可视化平台，用于编排、监控和管理多个opencode Agent协作完成复杂任务
---

# opencode Workflow Studio: 多Agent协作可视化平台

## 项目简介

**opencode Workflow Studio** 是一个基于 Web 的可视化平台，用于编排、监控和管理多个 opencode Agent 协作完成复杂任务。它提供了一个直观的拖拽式界面，让用户能够轻松创建复杂的 AI 工作流。

项目地址：[https://github.com/mu8429/claude-workflow-studio](https://github.com/mu8429/claude-workflow-studio)

## 核心功能

### 1. 可视化工作流编辑器

平台提供了 7 种节点类型，支持拖拽编排和 AI 自然语言生成工作流：

- **开始节点**：工作流入口
- **Agent 节点**：调用 AI 执行任务
- **自治判断节点**：AI 审查代码/内容，返回 JSON 格式的 pass/fail 结果，支持自愈循环
- **人工审批节点**：暂停等待用户审批，支持通过/拒绝，拒绝后自动将反馈传回主 Agent 重试修改
- **条件分支节点**：根据上游输出判断，选择一条分支执行
- **子工作流节点**：引用其他工作流，内联执行
- **结束节点**：汇总最终结果

### 2. 工作流模板市场

内置 13 个模板，覆盖常见开发场景：

- 代码审查工作流
- Bug 修复工作流
- 文档生成工作流
- 安全审计工作流
- 测试用例生成工作流
- 代码重构工作流

### 3. 技能市场

丰富的技能库，安装后自动创建 SKILL.md 文件，SDK 自动发现。技能可以扩展 Agent 的能力，让工作流更加灵活。

### 4. 实时流式输出

所有子 Agent 输出通过 WebSocket 实时推送（50ms 合流缓冲），让用户能够实时观察 Agent 的执行过程。

### 5. 断点续传

节点级检查点，崩溃或暂停后从断点恢复，确保长时间运行的工作流不会因为意外中断而丢失进度。

### 6. 记忆系统

按工作区隔离存储，支持开关控制、跨工作流传递、共享数据池，让 Agent 能够记住上下文信息。

## 快速开始

### 环境要求

- [Node.js 20+](https://nodejs.org/)
- [opencode CLI](https://opencode.ai)

### 安装步骤

```bash
# 1. 安装 opencode CLI
npm install -g opencode-ai

# 2. 配置 API 密钥
opencode auth login

# 3. 克隆项目
git clone https://github.com/mu8429/claude-workflow-studio.git
cd claude-workflow-studio

# 4. 安装依赖
npm install

# 5. 启动服务
npm start
```

启动后访问 `http://localhost:3000` 即可使用。

### Windows 用户快捷方式

项目提供了批处理脚本，方便 Windows 用户操作：

| 脚本 | 说明 |
|------|------|
| `install.bat` | 一键安装依赖 |
| `start.bat` | 启动服务 |
| `stop.bat` | 停止服务 |
| `restart.bat` | 重启服务 |

## 使用教程

### 场景一：单 Agent 任务

最简单的使用场景，让一个 Agent 完成特定任务：

1. 进入「智能体」页面，创建一个新的智能体
2. 进入「任务」页面，创建新任务
3. 选择 Agent，输入任务描述
4. 点击执行，观察实时输出

### 场景二：多 Agent 流水线

创建复杂的多 Agent 协作工作流：

1. 进入「工作流」页面，创建新工作流
2. 从左侧面板拖入 Agent 节点
3. 连接节点，定义执行顺序
4. 保存工作流
5. 进入「任务」页面，选择关联的工作流
6. 输入任务描述，执行工作流

### 场景三：代码审查工作流

使用内置模板快速创建代码审查流程：

1. 进入「工作流」页面
2. 点击「从模板创建」
3. 选择「代码审查」模板
4. 根据需要调整节点配置
5. 保存并执行

## 技术架构深度解析

### 系统架构

opencode Workflow Studio 采用前后端分离架构：

```
+------------------------------------------+
|              Browser (SPA)                |
|  Dashboard | Agents | Workflows | Terminal|
+---------------------+--------------------+
                      |  HTTP + WebSocket
+---------------------+--------------------+
|         Express + WebSocket Server        |
|  Routes | Middleware | Auth | Rate Limit  |
|  WorkflowService | AgentService | Memory  |
|  sql.js (WASM SQLite) | JSON | Workspace |
+---------------------+--------------------+
                      |
+---------------------+--------------------+
```

### 技术栈

| 层 | 技术 |
|---|---|
| 前端 | HTML + CSS + TypeScript/JS（SPA）+ xterm.js |
| 后端 | Node.js + Express + TypeScript |
| 实时通信 | WebSocket (ws)，实时 CRUD 事件推送 |
| AI 执行引擎 | opencode CLI（自动检测模型，支持多种 LLM 提供商） |
| 数据持久化 | sql.js (WASM SQLite) + JSON 文件 |

### 核心执行引擎：TS 状态机

平台采用 **TS 强状态机驱动执行**，核心原则是「脑子归 AI，手脚归代码」：

- TypeScript 代码直接控制工作流执行
- 主 Agent 无法「假装运行」子 Agent
- 通过拓扑排序确定执行顺序
- 直接调用 `query()` 启动子进程

```typescript
// WorkflowService._executeWorkflowStateMachine()
for (const nodeId of topoOrder) {
  const node = nodeMap.get(nodeId);

  switch (node.type) {
    case 'agent':
      // 直接调用 query() 启动子Agent
      nodeOutput = await sdkService._executeWithClaudeSdk(...);
      break;
    case 'condition':
      // 使用轻量级AI判断条件
      evalResult = sdkService._parseJsonSafely(evalRaw);
      break;
    case 'approval':
      // 挂起等待人工审批
      approvalResult = await new Promise((resolve) => { ... });
      break;
  }

  // 存储结果，传递给下一个节点
  nodeResults.set(nodeId, nodeOutput);
}
```

### Agent SDK 集成

平台使用 `@anthropic-ai/claude-agent-sdk` 作为执行引擎，通过 `query()` 函数启动独立子进程：

| 属性 | 说明 |
|------|------|
| 核心函数 | `query({ prompt, options })` |
| 子进程 | 每次调用启动独立的 `claude` 子进程 |
| 工具集 | 内置工具（Read、Write、Edit、Bash、Glob、Grep） |
| API Key | AES-256-GCM 加密存储 |

### 模型别名系统

所有模型引用使用别名，通过 `ApiKeyService.resolveModel()` 映射到实际模型：

| 别名 | 含义 | 典型场景 |
|------|------|----------|
| `opus` | 最强推理 | 复杂架构设计、多步骤推理 |
| `sonnet` | 平衡模型 | 日常编码、代码审查 |
| `haiku` | 快速轻量 | 简单任务、AI 工作流生成 |

### 安全机制

平台实现了多层安全防护：

- **API Key 加密**：AES-256-GCM 加密存储
- **命令白名单**：限制可执行的命令
- **并发执行防护**：防止资源竞争
- **工作区沙箱**：隔离不同项目
- **文件访问限制**：限制文件操作范围

## 高级功能

### 内嵌终端

基于 node-pty 的真实 PTY 终端，支持所有 shell 命令，自动在当前工作区打开。用户可以直接在 Web 界面中执行命令。

### 多工作区管理

独立运行环境，数据隔离，支持批量克隆工作流到其他工作区。适合管理多个项目。

### 知识库系统

分类/标签管理，全文搜索，可注入 Agent 执行，本地持久化存储。让 Agent 能够访问项目特定的知识。

### 数据分析面板

提供详细的执行统计：

- 执行成功率
- 平均耗时
- 按工作流统计
- 执行时间线

## 常见问题

### Q: Agent 执行失败？

检查 opencode CLI 是否安装（`opencode --version`），确保已配置 API 密钥（`opencode auth login`）

### Q: 工作流中断了？

重启服务，点击「续传」从断点恢复

### Q: 数据会丢吗？

每 2 秒自动保存，正常关闭不会丢数据

### Q: 能管理多个项目吗？

可以，通过「文件」→「切换工作区」创建独立环境

## 总结

opencode Workflow Studio 是一个功能强大的多 Agent 协作平台，它将复杂的 AI 工作流编排变得简单直观。无论你是想让多个 Agent 协作完成复杂任务，还是想创建自动化的开发流程，这个平台都能满足你的需求。

项目的开源性质也意味着你可以根据自己的需求进行定制和扩展。欢迎 Star、Fork 和贡献代码！

## 相关链接

- 项目地址：[https://github.com/mu8429/claude-workflow-studio](https://github.com/mu8429/claude-workflow-studio)
- opencode CLI：[https://opencode.ai](https://opencode.ai)
- Node.js：[https://nodejs.org/](https://nodejs.org/)
