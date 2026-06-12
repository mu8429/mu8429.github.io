---
title: "安全管理系统项目复盘"
date: 2026-06-12T13:00:00+08:00
lastmod: 2026-06-12T13:00:00+08:00
description: "复盘一个企业安全生产管理系统的技术架构、核心模块和项目亮点。"
categories:
  - 项目复盘
tags:
  - Spring Boot
  - Vue
  - MyBatis
  - Redis
  - MinIO
series:
  - 项目复盘
featured: false
draft: false
toc: true
weight: 6
---

## 项目背景

安全管理系统是一个企业安全生产管理系统，用于管理企业的安全生产相关工作。系统主要包括以下功能：

1. **用户权限管理**：管理用户、角色、权限
2. **任务管理**：管理安全生产任务
3. **文件管理**：管理安全生产相关文件
4. **数据导出**：导出各类报表数据

## 技术栈

### 后端技术栈

- **Spring Boot**：框架
- **MyBatis-Plus**：ORM 框架
- **MySQL**：数据库
- **Redis**：缓存
- **MinIO**：文件存储
- **JWT**：认证
- **Swagger**：API 文档

### 前端技术栈

- **Vue**：框架
- **Element UI**：UI 组件库
- **Axios**：HTTP 客户端
- **Vue Router**：路由
- **Vuex**：状态管理

## 用户权限模块

### 1. 功能设计

用户权限模块是系统的基础模块，主要包括：

- **用户管理**：增删改查用户信息
- **角色管理**：增删改查角色信息
- **菜单管理**：增删改查菜单信息
- **权限分配**：给用户分配角色，给角色分配权限

### 2. 技术实现

#### 用户认证

```java
@PostMapping("/login")
public Result login(@RequestBody LoginRequest request) {
    // 验证用户名密码
    User user = userService.verifyUser(request.getUsername(), request.getPassword());
    
    // 生成 JWT Token
    String token = JwtUtils.generateToken(user.getId());
    
    // 存储到 Redis
    redisTemplate.opsForValue().set("user:session:" + user.getId(), token, 7200, TimeUnit.SECONDS);
    
    return Result.success(new LoginResponse(token, user));
}
```

#### 权限校验

```java
@RequiresPermissions("system:user:list")
@GetMapping("/list")
public Result list() {
    // 查询用户列表
    return Result.success(userService.list());
}
```

### 3. 项目亮点

1. **动态路由**：根据用户权限动态生成前端路由
2. **按钮权限**：支持细粒度的按钮权限控制
3. **数据权限**：支持按部门、按用户的数据权限控制

## 任务管理模块

### 1. 功能设计

任务管理模块用于管理安全生产任务，主要包括：

- **任务创建**：创建安全生产任务
- **任务分配**：将任务分配给用户
- **任务执行**：用户执行任务并提交结果
- **任务审核**：审核任务执行结果

### 2. 技术实现

#### 任务状态流转

```java
public enum TaskStatus {
    PENDING(0, "待处理"),
    IN_PROGRESS(1, "处理中"),
    COMPLETED(2, "已完成"),
    REJECTED(3, "已驳回"),
    CANCELLED(4, "已取消");
    
    private int code;
    private String name;
}
```

#### 任务流程引擎

```java
@Service
public class TaskService {
    
    public void createTask(Task task) {
        // 保存任务
        taskMapper.insert(task);
        
        // 发送通知
        notificationService.sendTaskNotification(task);
    }
    
    public void completeTask(Long taskId, TaskResult result) {
        // 更新任务状态
        Task task = taskMapper.selectById(taskId);
        task.setStatus(TaskStatus.COMPLETED.getCode());
        task.setResult(result);
        taskMapper.updateById(task);
        
        // 发送审核通知
        notificationService.sendReviewNotification(task);
    }
}
```

### 3. 项目亮点

1. **状态机**：使用状态机管理任务状态流转
2. **消息通知**：支持多种消息通知方式
3. **任务催办**：支持任务催办功能

## 文件管理模块

### 1. 功能设计

文件管理模块用于管理安全生产相关文件，主要包括：

- **文件上传**：上传文件到 MinIO
- **文件下载**：从 MinIO 下载文件
- **文件预览**：在线预览文件
- **文件版本**：支持文件版本管理

### 2. 技术实现

#### 文件上传

```java
@PostMapping("/upload")
public Result upload(@RequestParam("file") MultipartFile file) {
    // 生成文件名
    String fileName = generateFileName(file.getOriginalFilename());
    
    // 上传到 MinIO
    String fileUrl = minioService.uploadFile("safety", fileName, file.getInputStream());
    
    // 保存文件信息
    FileInfo fileInfo = new FileInfo();
    fileInfo.setFileName(file.getOriginalFilename());
    fileInfo.setFilePath(fileUrl);
    fileInfo.setFileSize(file.getSize());
    fileInfoMapper.insert(fileInfo);
    
    return Result.success(fileInfo);
}
```

#### 文件预览

```java
@GetMapping("/preview/{fileId}")
public void preview(@PathVariable Long fileId, HttpServletResponse response) {
    // 查询文件信息
    FileInfo fileInfo = fileInfoMapper.selectById(fileId);
    
    // 从 MinIO 获取文件
    try (InputStream inputStream = minioService.getFile(fileInfo.getFilePath())) {
        // 设置响应头
        response.setContentType(fileInfo.getContentType());
        
        // 写入响应
        IOUtils.copy(inputStream, response.getOutputStream());
        response.flushBuffer();
    }
}
```

### 3. 项目亮点

1. **断点续传**：支持大文件断点续传
2. **秒传**：支持文件秒传
3. **在线预览**：支持多种文件格式在线预览

## 数据导出模块

### 1. 功能设计

数据导出模块用于导出各类报表数据，主要包括：

- **用户导出**：导出用户数据
- **任务导出**：导出任务数据
- **统计导出**：导出统计数据

### 2. 技术实现

#### 异步导出

```java
@Async
public void exportUsers(Long taskId) {
    try {
        // 更新任务状态
        updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
        
        // 查询数据
        List<User> users = queryAllUsers();
        
        // 生成 Excel
        String filePath = generateExcel(users);
        
        // 上传到 MinIO
        String fileUrl = minioService.uploadFile("export", filePath);
        
        // 更新任务结果
        updateTaskResult(taskId, TaskStatus.COMPLETED, fileUrl);
        
    } catch (Exception e) {
        // 更新任务失败
        updateTaskStatus(taskId, TaskStatus.FAILED, e.getMessage());
    }
}
```

### 3. 项目亮点

1. **异步导出**：支持大数据量异步导出
2. **导出模板**：支持自定义导出模板
3. **导出记录**：支持导出记录查询

## 总结

安全管理系统是一个功能完善的企业级应用，通过这个项目，我学到了很多关于系统设计、技术实现和项目管理的经验。

### 项目收获

1. **技术能力**：掌握了 Spring Boot、Vue、MyBatis 等技术
2. **系统设计**：学会了如何设计企业级系统
3. **项目管理**：学会了如何管理项目进度和质量

### 不足之处

1. **性能优化**：部分功能性能有待优化
2. **代码质量**：部分代码质量有待提高
3. **文档完善**：项目文档有待完善

### 改进方向

1. **引入微服务**：考虑引入微服务架构
2. **容器化部署**：考虑使用 Docker 容器化部署
3. **自动化测试**：增加自动化测试覆盖率
