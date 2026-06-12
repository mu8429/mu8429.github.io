---
title: "后端大数据量导出如何设计"
author: mu8429
date: 2026-06-12T13:00:00+08:00
lastmod: 2026-06-12T13:00:00+08:00
description: "总结后台管理系统中大数据量导出的常见处理方案，包括分页查询、异步任务、文件存储和下载通知。"
categories:
  - 数据库
tags:
  - 数据导出
  - MySQL
  - Excel
  - 异步任务
series:
  - 数据库
featured: false
draft: false
toc: true
weight: 5
---

## 为什么不能一次性导出

在后台管理系统中，导出数据是一个常见需求。但是，当数据量很大时，一次性导出会导致以下问题：

### 1. 内存溢出

```java
// ❌ 错误示例：一次性加载所有数据
List<User> users = userService.list();  // 可能有几百万条数据
ExcelUtils.export(users);  // 内存溢出
```

### 2. 响应超时

- 大数据量查询耗时长
- Excel 生成耗时长
- 网络传输耗时长
- 浏览器等待超时

### 3. 数据库压力

- 长时间占用数据库连接
- 大量数据查询影响其他业务

## 分页查询

### 1. 基本分页

```java
public void exportUsers() {
    int pageNum = 1;
    int pageSize = 1000;
    
    while (true) {
        // 分页查询
        Page<User> page = new Page<>(pageNum, pageSize);
        IPage<User> result = userMapper.selectPage(page, null);
        
        if (result.getRecords().isEmpty()) {
            break;
        }
        
        // 处理数据
        processUsers(result.getRecords());
        
        pageNum++;
    }
}
```

### 2. 流式查询

```java
public void exportUsers() {
    // 使用流式查询，避免内存溢出
    try (Cursor<User> cursor = userMapper.selectCursor(null)) {
        for (User user : cursor) {
            // 逐条处理
            processUser(user);
        }
    }
}
```

## 异步任务

### 1. 任务表设计

```sql
CREATE TABLE export_task (
    id BIGINT PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status TINYINT DEFAULT 0,  -- 0: 待处理, 1: 处理中, 2: 已完成, 3: 失败
    file_path VARCHAR(500),
    file_size BIGINT,
    total_count INT,
    success_count INT,
    fail_count INT,
    error_message TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    expire_time DATETIME
);
```

### 2. 任务处理

```java
@Service
public class ExportService {
    
    @Async
    public void exportUsers(Long taskId) {
        try {
            // 更新任务状态
            updateTaskStatus(taskId, 1);
            
            // 查询数据
            List<User> users = queryAllUsers();
            
            // 生成 Excel
            String filePath = generateExcel(users);
            
            // 上传到文件存储
            String fileUrl = uploadToMinio(filePath);
            
            // 更新任务结果
            updateTaskResult(taskId, 2, fileUrl);
            
        } catch (Exception e) {
            // 更新任务失败
            updateTaskStatus(taskId, 3, e.getMessage());
        }
    }
}
```

## Excel 分批写入

### 1. 使用 EasyExcel

```java
public void exportUsers(Long taskId) {
    String filePath = "/tmp/users.xlsx";
    
    try (ExcelWriter writer = EasyExcel.write(filePath, UserExportVO.class).build()) {
        WriteSheet sheet = EasyExcel.writerSheet("用户列表").build();
        
        int pageNum = 1;
        int pageSize = 1000;
        
        while (true) {
            // 分页查询
            List<User> users = queryUsers(pageNum, pageSize);
            
            if (users.isEmpty()) {
                break;
            }
            
            // 转换为导出对象
            List<UserExportVO> exportList = convertToExportVO(users);
            
            // 写入 Excel
            writer.write(exportList, sheet);
            
            pageNum++;
        }
    }
}
```

### 2. 使用 SXSSFWorkbook

```java
public void exportUsers() {
    // 使用 SXSSFWorkbook，支持大数据量
    SXSSFWorkbook workbook = new SXSSFWorkbook(1000);  // 内存中只保留 1000 行
    
    try {
        Sheet sheet = workbook.createSheet("用户列表");
        
        int rowNum = 0;
        int pageNum = 1;
        int pageSize = 1000;
        
        while (true) {
            List<User> users = queryUsers(pageNum, pageSize);
            
            if (users.isEmpty()) {
                break;
            }
            
            for (User user : users) {
                Row row = sheet.createRow(rowNum++);
                // 写入数据
                row.createCell(0).setCellValue(user.getUsername());
                row.createCell(1).setCellValue(user.getRealName());
                // ...
            }
            
            pageNum++;
        }
        
        // 写入文件
        try (FileOutputStream out = new FileOutputStream("/tmp/users.xlsx")) {
            workbook.write(out);
        }
        
    } finally {
        workbook.dispose();  // 清理临时文件
    }
}
```

## MinIO 文件存储

### 1. 上传文件

```java
@Service
public class MinioService {
    
    @Autowired
    private MinioClient minioClient;
    
    public String uploadFile(String bucketName, String objectName, InputStream inputStream) {
        try {
            // 创建存储桶
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            
            // 上传文件
            minioClient.putObject(PutObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .stream(inputStream, inputStream.available(), -1)
                .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .build());
            
            // 返回访问 URL
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .method(Method.GET)
                .build());
                
        } catch (Exception e) {
            throw new RuntimeException("上传文件失败", e);
        }
    }
}
```

### 2. 下载文件

```java
@GetMapping("/download/{taskId}")
public void download(@PathVariable Long taskId, HttpServletResponse response) {
    // 查询任务信息
    ExportTask task = exportTaskMapper.selectById(taskId);
    
    if (task == null || task.getStatus() != 2) {
        throw new RuntimeException("文件不存在");
    }
    
    // 从 MinIO 获取文件
    try (InputStream inputStream = minioService.getFile(task.getFilePath())) {
        // 设置响应头
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(task.getTaskName() + ".xlsx", "UTF-8"));
        
        // 写入响应
        IOUtils.copy(inputStream, response.getOutputStream());
        response.flushBuffer();
        
    } catch (Exception e) {
        throw new RuntimeException("下载文件失败", e);
    }
}
```

## 导出状态表设计

### 1. 状态流转

```
待处理 (0) → 处理中 (1) → 已完成 (2)
                    ↓
                失败 (3)
```

### 2. 查询导出任务

```java
@GetMapping("/list")
public Result list() {
    Long userId = SecurityUtils.getUserId();
    
    // 查询用户的导出任务
    List<ExportTask> tasks = exportTaskMapper.selectList(
        new LambdaQueryWrapper<ExportTask>()
            .eq(ExportTask::getCreateBy, userId)
            .orderByDesc(ExportTask::getCreateTime)
            .last("LIMIT 100")
    );
    
    return Result.success(tasks);
}
```

### 3. 前端轮询

```javascript
// 轮询任务状态
const pollTaskStatus = async (taskId) => {
  const timer = setInterval(async () => {
    const res = await getTaskStatus(taskId)
    const { status, fileUrl } = res.data
    
    if (status === 2) {
      // 任务完成
      clearInterval(timer)
      // 下载文件
      window.open(fileUrl)
    } else if (status === 3) {
      // 任务失败
      clearInterval(timer)
      ElMessage.error('导出失败')
    }
  }, 2000)  // 每 2 秒轮询一次
}
```

## 总结

大数据量导出是一个常见的需求，需要考虑内存、性能、用户体验等多个方面。通过分页查询、异步任务、文件存储等技术，可以实现高效、稳定的数据导出功能。

在实际项目中，还需要根据具体需求进行优化，比如压缩文件、分卷导出、导出模板等。
