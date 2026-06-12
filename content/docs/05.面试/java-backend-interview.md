---
title: "Java 后端面试常见问题整理"
author: mu8429
date: 2026-06-12T13:00:00+08:00
lastmod: 2026-06-12T13:00:00+08:00
description: "整理 Java 后端开发面试中常见的技术问题，包括线程、事务、索引、缓存、权限和项目经验。"
categories:
  - 面试
tags:
  - Java
  - 面试
  - Spring Boot
  - MySQL
  - Redis
series:
  - 面试
featured: true
draft: false
toc: true
weight: 8
---

## Java 基础

### 1. Java 中 == 和 equals 的区别？

**==**：
- 比较基本类型时，比较的是值
- 比较引用类型时，比较的是内存地址

**equals**：
- 默认比较内存地址（Object 类）
- 可以重写，比较对象内容

```java
String s1 = new String("hello");
String s2 = new String("hello");

System.out.println(s1 == s2);      // false，比较地址
System.out.println(s1.equals(s2)); // true，比较内容
```

### 2. String、StringBuilder、StringBuffer 的区别？

**String**：
- 不可变对象
- 线程安全
- 每次修改都会创建新对象

**StringBuilder**：
- 可变对象
- 线程不安全
- 性能最好

**StringBuffer**：
- 可变对象
- 线程安全（使用 synchronized）
- 性能次之

### 3. 接口和抽象类的区别？

**接口**：
- 只能有抽象方法（Java 8 后可以有默认方法）
- 只能有常量
- 支持多继承
- 使用 interface 关键字

**抽象类**：
- 可以有抽象方法和普通方法
- 可以有成员变量
- 只能单继承
- 使用 abstract 关键字

### 4. Java 中的异常体系？

```
Throwable
├── Error（错误，不可恢复）
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception（异常，可捕获）
    ├── RuntimeException（运行时异常，非受检异常）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   └── ...
    └── 非 RuntimeException（编译异常，受检异常）
        ├── IOException
        ├── SQLException
        └── ...
```

## 多线程

### 1. 创建线程的方式？

**1. 继承 Thread 类**

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread running");
    }
}
```

**2. 实现 Runnable 接口**

```java
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable running");
    }
}
```

**3. 实现 Callable 接口**

```java
public class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        return "Callable result";
    }
}
```

**4. 使用线程池**

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> {
    System.out.println("Task running");
});
executor.shutdown();
```

### 2. 线程池的核心参数？

```java
public ThreadPoolExecutor(
    int corePoolSize,       // 核心线程数
    int maximumPoolSize,    // 最大线程数
    long keepAliveTime,     // 空闲线程存活时间
    TimeUnit unit,          // 时间单位
    BlockingQueue<Runnable> workQueue,  // 任务队列
    ThreadFactory threadFactory,        // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

### 3. synchronized 和 ReentrantLock 的区别？

**synchronized**：
- JVM 层面实现
- 自动释放锁
- 非公平锁
- 不可中断

**ReentrantLock**：
- API 层面实现
- 手动释放锁
- 支持公平锁/非公平锁
- 支持中断
- 支持超时
- 支持条件变量

### 4. volatile 关键字的作用？

1. **保证可见性**：一个线程修改后，其他线程立即可见
2. **禁止指令重排序**：防止编译器优化导致的顺序问题
3. **不保证原子性**：不能保证复合操作的原子性

```java
private volatile boolean flag = false;

// 线程 1
flag = true;

// 线程 2
while (!flag) {
    // 等待
}
```

## MySQL

### 1. MySQL 索引的数据结构？

MySQL 默认使用 B+ 树作为索引数据结构：

**B+ 树的特点**：
- 非叶子节点只存储索引，不存储数据
- 叶子节点存储数据，且通过链表连接
- 树的高度低，查询效率高
- 支持范围查询

### 2. 索引失效的情况？

1. **违反最左前缀原则**
2. **在索引列上做函数操作**
3. **在索引列上做类型转换**
4. **使用 != 或 <>**
5. **使用 LIKE '%xxx'**
6. **使用 OR 连接非索引列**
7. **使用 IS NULL 或 IS NOT NULL**

### 3. 事务的 ACID 特性？

**A（Atomicity）原子性**：事务是不可分割的工作单位

**C（Consistency）一致性**：事务前后数据保持一致

**I（Isolation）隔离性**：多个事务并发执行时，互不干扰

**D（Durability）持久性**：事务提交后，数据永久保存

### 4. MySQL 的事务隔离级别？

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| READ UNCOMMITTED | ✓ | ✓ | ✓ |
| READ COMMITTED | ✗ | ✓ | ✓ |
| REPEATABLE READ | ✗ | ✗ | ✗ |
| SERIALIZABLE | ✗ | ✗ | ✗ |

## Redis

### 1. Redis 的数据类型？

1. **String**：字符串
2. **List**：列表
3. **Hash**：哈希
4. **Set**：集合
5. **Sorted Set**：有序集合

### 2. Redis 缓存穿透、击穿、雪崩？

**缓存穿透**：查询不存在的数据
- 解决：布隆过滤器、缓存空值

**缓存击穿**：热点 key 过期
- 解决：互斥锁、永不过期

**缓存雪崩**：大量 key 同时过期
- 解决：随机过期时间、多级缓存

### 3. Redis 的持久化方式？

**RDB（Redis Database）**：
- 定时快照
- 恢复速度快
- 可能丢失数据

**AOF（Append Only File）**：
- 记录写命令
- 数据安全性高
- 文件体积大

### 4. Redis 如何实现分布式锁？

```java
// 获取锁
String lockKey = "lock:order:" + orderId;
String requestId = UUID.randomUUID().toString();
boolean locked = redisTemplate.opsForValue()
    .setIfAbsent(lockKey, requestId, 10, TimeUnit.SECONDS);

if (locked) {
    try {
        // 执行业务逻辑
    } finally {
        // 释放锁
        if (requestId.equals(redisTemplate.opsForValue().get(lockKey))) {
            redisTemplate.delete(lockKey);
        }
    }
}
```

## Spring Boot

### 1. Spring Boot 的核心注解？

**@SpringBootApplication**：
- @SpringBootConfiguration
- @EnableAutoConfiguration
- @ComponentScan

### 2. Spring IOC 和 AOP？

**IOC（控制反转）**：
- 将对象创建和依赖注入交给 Spring 容器管理
- 降低代码耦合度

**AOP（面向切面编程）**：
- 将横切关注点（如日志、事务）从业务逻辑中分离
- 使用动态代理实现

### 3. Spring Bean 的生命周期？

1. 实例化
2. 属性赋值
3. 初始化
4. 使用
5. 销毁

### 4. Spring 事务失效的场景？

1. **方法不是 public**
2. **自调用**
3. **异常被 catch**
4. **异常类型不匹配**
5. **数据库不支持事务**

## 项目问题

### 1. 项目中遇到的难点？

**难点**：大数据量导出导致内存溢出

**解决方案**：
1. 使用分页查询
2. 使用异步任务
3. 使用流式写入
4. 使用文件存储

### 2. 如何保证接口幂等性？

1. **Token 机制**：每次请求携带唯一 Token
2. **唯一索引**：数据库添加唯一索引
3. **乐观锁**：使用版本号控制
4. **分布式锁**：使用 Redis 分布式锁

### 3. 如何处理分布式事务？

1. **2PC（两阶段提交）**：强一致性，性能差
3. **TCC**：补偿事务，实现复杂
4. **本地消息表**：最终一致性，实现简单
5. **MQ 事务消息**：最终一致性，依赖 MQ

## 场景题

### 1. 如何设计一个秒杀系统？

1. **前端限流**：按钮防抖、验证码
2. **后端限流**：令牌桶、滑动窗口
3. **库存预扣减**：Redis 预扣减库存
4. **异步下单**：MQ 异步处理订单
5. **订单超时**：定时任务取消超时订单

### 2. 如何设计一个短链接系统？

1. **生成短链接**：使用 MD5 或自增 ID
2. **存储映射**：使用 Redis 或数据库
3. **重定向**：301 或 302 重定向
4. **统计点击**：异步记录点击日志

### 3. 如何设计一个限流系统？

1. **计数器**：固定窗口计数
2. **滑动窗口**：滑动时间窗口计数
3. **漏桶算法**：恒定速率处理
4. **令牌桶算法**：恒定速率生成令牌

## 总结

面试准备是一个持续的过程，需要不断学习和总结。通过整理常见问题，可以帮助我们更好地理解技术原理，提高面试通过率。

在准备面试时，不仅要记住答案，还要理解原理，能够举一反三。
