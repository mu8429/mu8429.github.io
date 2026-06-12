---
title: "RBAC 权限系统设计：用户、角色、菜单与按钮权限"
date: 2026-06-12T13:00:00+08:00
lastmod: 2026-06-12T13:00:00+08:00
description: "整理后台管理系统中常见的 RBAC 权限模型，说明用户、角色、菜单、按钮之间的关系。"
categories:
  - Java 后端
tags:
  - RBAC
  - 权限系统
  - Spring Boot
series:
  - Java 后端
featured: false
draft: false
toc: true
weight: 4
---

## RBAC 是什么

RBAC（Role-Based Access Control）是一种基于角色的访问控制模型。它的核心思想是：

1. **用户**：系统的使用者
2. **角色**：权限的集合
3. **权限**：对资源的操作权限

通过将权限分配给角色，再将角色分配给用户，实现权限管理。

### RBAC 的优势

1. **简化权限管理**：不需要直接给用户分配权限
2. **易于维护**：修改角色权限，所有用户都会更新
3. **灵活扩展**：可以方便地添加新角色和权限

## 表结构设计

### 核心表

```sql
-- 用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    role_key VARCHAR(50) NOT NULL,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 菜单表
CREATE TABLE sys_menu (
    id BIGINT PRIMARY KEY,
    menu_name VARCHAR(50) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    path VARCHAR(200),
    component VARCHAR(200),
    menu_type CHAR(1),  -- M: 目录, C: 菜单, F: 按钮
    perms VARCHAR(100),
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1
);

-- 用户角色关联表
CREATE TABLE sys_user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- 角色菜单关联表
CREATE TABLE sys_role_menu (
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, menu_id)
);
```

### 表关系

```
用户 (1) -----> (N) 用户角色关联 (N) <----- (1) 角色
                                        |
                                        |
                                        v
                                    角色菜单关联
                                        |
                                        |
                                        v
                                      菜单
```

## 菜单权限与按钮权限

### 菜单权限

菜单权限控制用户可以看到哪些页面：

```java
// 菜单类型
public enum MenuType {
    DIRECTORY("M"),  // 目录
    MENU("C"),       // 菜单
    BUTTON("F");     // 按钮
    
    private String code;
}
```

### 按钮权限

按钮权限控制用户可以执行哪些操作：

```java
// 按钮权限标识
public class Perms {
    public static final String USER_ADD = "system:user:add";
    public static final String USER_EDIT = "system:user:edit";
    public static final String USER_DELETE = "system:user:delete";
    public static final String USER_EXPORT = "system:user:export";
}
```

### 前端使用

```vue
<template>
  <div>
    <!-- 根据权限显示按钮 -->
    <el-button v-if="hasPerms('system:user:add')" @click="addUser">
      添加用户
    </el-button>
    <el-button v-if="hasPerms('system:user:edit')" @click="editUser">
      编辑用户
    </el-button>
    <el-button v-if="hasPerms('system:user:delete')" @click="deleteUser">
      删除用户
    </el-button>
  </div>
</template>

<script>
export default {
  methods: {
    hasPerms(perms) {
      return this.$store.state.user.perms.includes(perms)
    }
  }
}
</script>
```

## 前端动态路由

根据用户权限动态生成路由：

### 1. 获取用户菜单

```java
@GetMapping("/getRouters")
public Result getRouters() {
    Long userId = SecurityUtils.getUserId();
    
    // 查询用户菜单
    List<Menu> menus = menuService.selectMenuByUserId(userId);
    
    // 构建路由树
    List<RouterVo> routers = buildRouterTree(menus);
    
    return Result.success(routers);
}
```

### 2. 前端处理

```javascript
// 获取用户信息
const getUserInfo = async () => {
  const res = await getUserInfo()
  const { user, perms, menus } = res.data
  
  // 存储权限
  store.commit('SET_PERMS', perms)
  
  // 动态添加路由
  const routes = buildRoutes(menus)
  routes.forEach(route => {
    router.addRoute(route)
  })
}
```

## 后端接口鉴权

### 1. 自定义注解

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermissions {
    String[] value();
}
```

### 2. AOP 切面

```java
@Aspect
@Component
public class PermissionAspect {
    
    @Around("@annotation(requiresPermissions)")
    public Object around(ProceedingJoinPoint point, RequiresPermissions requiresPermissions) throws Throwable {
        // 获取当前用户权限
        List<String> perms = SecurityUtils.getUserPerms();
        
        // 检查权限
        String[] requiredPerms = requiresPermissions.value();
        boolean hasPermission = Arrays.stream(requiredPerms)
            .anyMatch(perms::contains);
        
        if (!hasPermission) {
            throw new RuntimeException("没有权限");
        }
        
        return point.proceed();
    }
}
```

### 3. 使用示例

```java
@RestController
@RequestMapping("/system/user")
public class UserController {
    
    @RequiresPermissions("system:user:list")
    @GetMapping("/list")
    public Result list() {
        // 查询用户列表
        return Result.success(userService.list());
    }
    
    @RequiresPermissions("system:user:add")
    @PostMapping
    public Result add(@RequestBody User user) {
        // 添加用户
        return Result.success(userService.add(user));
    }
}
```

## 常见面试问题

### 1. RBAC 和 ABAC 的区别？

**RBAC**：
- 基于角色的访问控制
- 权限与角色关联
- 简单易实现

**ABAC**：
- 基于属性的访问控制
- 权限与属性关联
- 更灵活，更复杂

### 2. 如何处理角色权限变更？

1. **实时生效**：修改角色权限后，立即生效
2. **缓存处理**：清除用户权限缓存
3. **会话处理**：强制用户重新登录

### 3. 如何设计多级管理员？

1. **超级管理员**：拥有所有权限
2. **部门管理员**：只能管理本部门用户
3. **普通用户**：只能操作自己的数据

### 4. 如何处理数据权限？

1. **全部数据**：可以查看所有数据
2. **本部门数据**：只能查看本部门数据
3. **本部门及以下**：可以查看本部门及下级部门数据
4. **仅本人数据**：只能查看自己的数据

## 总结

RBAC 权限系统是后台管理系统的基础，通过合理的设计，可以实现灵活、安全的权限管理。在实际项目中，还需要根据具体需求进行扩展，比如数据权限、字段权限等。
