---
title: "Spring Boot 中基于 JWT + Redis 的登录认证设计"
date: 2026-06-12T13:00:00+08:00
lastmod: 2026-06-12T13:00:00+08:00
description: "总结后端项目中常见的登录认证设计，包括 Token 生成、Redis 会话存储、验证码、续期和强制下线。"
categories:
  - Java 后端
tags:
  - Spring Boot
  - JWT
  - Redis
  - 登录认证
series:
  - Java 后端
featured: true
draft: false
toc: true
weight: 3
---

## 登录认证流程

在后端项目中，登录认证是一个非常重要的功能。基于 JWT + Redis 的登录认证流程如下：

### 1. 用户登录

```
用户输入账号密码
    ↓
后端验证账号密码
    ↓
生成 JWT Token
    ↓
将 Token 存入 Redis
    ↓
返回 Token 给前端
```

### 2. 请求认证

```
前端携带 Token 请求
    ↓
拦截器验证 Token
    ↓
从 Redis 查询 Token
    ↓
验证 Token 是否过期
    ↓
验证通过，处理请求
```

## Redis 存储哪些数据

在登录认证中，Redis 主要存储以下数据：

### 1. 用户会话

```redis
# 用户会话
SET user:session:{userId} {token} EX 7200

# Token 到用户的映射
SET token:user:{token} {userId} EX 7200
```

### 2. 验证码

```redis
# 图形验证码
SET captcha:{uuid} {code} EX 300

# 短信验证码
SET sms:{phone} {code} EX 300
```

### 3. 登录失败次数

```redis
# 登录失败次数
SET login:fail:{username} {count} EX 1800
```

### 4. Token 黑名单

```redis
# Token 黑名单（用于强制下线）
SET token:blacklist:{token} 1 EX 7200
```

## Token 校验流程

Token 校验是登录认证的核心流程：

### 1. 解析 Token

```java
public Claims parseToken(String token) {
    try {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody();
    } catch (Exception e) {
        throw new RuntimeException("Token 无效");
    }
}
```

### 2. 验证 Token 是否在 Redis 中

```java
public boolean isTokenValid(String token) {
    // 检查 Token 是否在黑名单中
    if (redisTemplate.hasKey("token:blacklist:" + token)) {
        return false;
    }
    
    // 检查 Token 是否在有效会话中
    String userId = redisTemplate.opsForValue().get("token:user:" + token);
    return userId != null;
}
```

### 3. 刷新 Token

```java
public void refreshToken(String token) {
    // 刷新 Token 过期时间
    redisTemplate.expire("user:session:" + userId, 7200, TimeUnit.SECONDS);
    redisTemplate.expire("token:user:" + token, 7200, TimeUnit.SECONDS);
}
```

## 单端登录控制

在某些场景下，需要限制用户只能在一个设备上登录：

### 实现方式

1. **登录时**：删除用户旧的会话
2. **请求时**：验证当前 Token 是否是最新的

### 代码实现

```java
public void login(String username, String password) {
    // 验证用户名密码
    User user = verifyUser(username, password);
    
    // 删除旧会话
    String oldToken = redisTemplate.opsForValue().get("user:session:" + user.getId());
    if (oldToken != null) {
        redisTemplate.delete("token:user:" + oldToken);
    }
    
    // 生成新 Token
    String newToken = generateToken(user);
    
    // 存储新会话
    redisTemplate.opsForValue().set("user:session:" + user.getId(), newToken, 7200, TimeUnit.SECONDS);
    redisTemplate.opsForValue().set("token:user:" + newToken, user.getId().toString(), 7200, TimeUnit.SECONDS);
    
    return newToken;
}
```

## 修改密码后强制下线

当用户修改密码后，需要强制下线所有设备：

### 实现方式

1. **修改密码时**：删除用户所有会话
2. **添加 Token 到黑名单**：使旧 Token 失效

### 代码实现

```java
public void changePassword(Long userId, String oldPassword, String newPassword) {
    // 验证旧密码
    verifyPassword(userId, oldPassword);
    
    // 更新密码
    updatePassword(userId, newPassword);
    
    // 强制下线所有设备
    forceLogout(userId);
}

public void forceLogout(Long userId) {
    // 获取用户当前 Token
    String token = redisTemplate.opsForValue().get("user:session:" + userId);
    
    // 删除用户会话
    redisTemplate.delete("user:session:" + userId);
    
    // 将 Token 加入黑名单
    if (token != null) {
        redisTemplate.opsForValue().set("token:blacklist:" + token, 1, 7200, TimeUnit.SECONDS);
        redisTemplate.delete("token:user:" + token);
    }
}
```

## 面试常问问题

### 1. JWT 和 Session 的区别？

**JWT**：
- 无状态，不需要存储会话
- 可以跨服务使用
- 安全性依赖签名

**Session**：
- 有状态，需要存储会话
- 依赖 Cookie
- 安全性依赖服务端存储

### 2. 为什么使用 Redis 存储 Token？

1. **支持分布式**：多个服务实例可以共享会话
2. **支持过期**：可以设置 Token 过期时间
3. **支持强制下线**：可以主动删除会话
4. **性能好**：Redis 读写速度快

### 3. 如何防止 Token 被盗用？

1. **使用 HTTPS**：防止 Token 被中间人截获
2. **设置合理过期时间**：减少 Token 被盗用的风险
3. **绑定设备信息**：将 Token 与设备信息绑定
4. **使用刷新 Token**：Access Token 短期，Refresh Token 长期

### 4. 如何实现 Token 续期？

1. **滑动过期**：每次请求刷新 Token 过期时间
2. **双 Token 机制**：Access Token 短期，Refresh Token 长期
3. **自动续期**：Token 即将过期时自动续期

## 总结

JWT + Redis 的登录认证方案是目前比较流行的方案，它结合了 JWT 的无状态特性和 Redis 的存储能力。通过合理的设计，可以实现安全、高效、可扩展的登录认证系统。

在实际项目中，还需要根据具体需求进行调整，比如多端登录、单点登录、OAuth2 等。
