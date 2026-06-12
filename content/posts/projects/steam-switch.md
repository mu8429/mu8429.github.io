---
title: "Steam Switch：Windows 桌面端 Steam 账号快速切换工具设想"
date: 2026-06-12T13:00:00+08:00
lastmod: 2026-06-12T13:00:00+08:00
description: "整理 Steam 账号快速切换工具的功能设想，包括账号管理、系统托盘、任务栏集成和 Steam 库注入。"
categories:
  - 项目复盘
tags:
  - Steam
  - Windows
  - 桌面工具
series:
  - 项目复盘
featured: false
draft: false
toc: true
weight: 7
---

## 项目背景

作为一个 Steam 玩家，我经常需要在多个 Steam 账号之间切换。每次切换都需要：

1. 退出当前账号
2. 重新输入账号密码
3. 等待登录验证

这个过程非常繁琐，尤其是对于有多个账号的用户。

因此，我设想了一个 Steam 账号快速切换工具——Steam Switch。

## 核心功能

### 1. 账号管理

- **账号添加**：添加多个 Steam 账号
- **账号编辑**：编辑账号信息
- **账号删除**：删除账号
- **账号排序**：拖拽排序账号

### 2. 快速切换

- **一键切换**：点击账号即可切换
- **自动登录**：自动完成登录流程
- **记住密码**：安全地记住账号密码

### 3. 系统托盘

- **托盘图标**：最小化到系统托盘
- **右键菜单**：右键快速切换账号
- **开机自启**：支持开机自启动

### 4. 任务栏集成

- **任务栏图标**：在任务栏显示 Steam Switch
- **跳转列表**：右键任务栏图标显示账号列表
- **固定到任务栏**：支持固定到任务栏

## UI 设计

### 1. 主界面

```
+------------------------------------------+
|           Steam Switch                   |
+------------------------------------------+
|  [+ 添加账号]                             |
+------------------------------------------+
|  [头像] 账号1                    [切换]   |
|  [头像] 账号2                    [切换]   |
|  [头像] 账号3                    [切换]   |
+------------------------------------------+
|  [设置]  [关于]  [退出]                   |
+------------------------------------------+
```

### 2. 账号编辑界面

```
+------------------------------------------+
|           编辑账号                        |
+------------------------------------------+
|  账号名称: [input]                        |
|  Steam ID: [input]                        |
|  密码:     [input] [显示/隐藏]            |
|  头像:     [选择图片]                     |
+------------------------------------------+
|  [保存]  [取消]                           |
+------------------------------------------+
```

### 3. 设置界面

```
+------------------------------------------+
|           设置                            |
+------------------------------------------+
|  [x] 开机自启动                           |
|  [x] 最小化到托盘                         |
|  [x] 显示通知                             |
|  [x] 自动检查更新                         |
+------------------------------------------+
|  [保存]  [取消]                           |
+------------------------------------------+
```

## 技术难点

### 1. Steam 进程注入

Steam Switch 需要与 Steam 客户端进行交互，这需要使用进程注入技术：

```c++
// 注入 DLL 到 Steam 进程
BOOL InjectDLL(DWORD processId, const char* dllPath) {
    // 打开进程
    HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, processId);
    if (hProcess == NULL) {
        return FALSE;
    }
    
    // 分配内存
    LPVOID pDllPath = VirtualAllocEx(hProcess, NULL, strlen(dllPath) + 1, 
                                      MEM_COMMIT, PAGE_READWRITE);
    if (pDllPath == NULL) {
        CloseHandle(hProcess);
        return FALSE;
    }
    
    // 写入 DLL 路径
    WriteProcessMemory(hProcess, pDllPath, dllPath, strlen(dllPath) + 1, NULL);
    
    // 创建远程线程
    HANDLE hThread = CreateRemoteThread(hProcess, NULL, 0, 
                                         (LPTHREAD_START_ROUTINE)GetProcAddress(
                                             GetModuleHandle("kernel32.dll"), 
                                             "LoadLibraryA"),
                                         pDllPath, 0, NULL);
    
    // 清理
    VirtualFreeEx(hProcess, pDllPath, 0, MEM_RELEASE);
    CloseHandle(hThread);
    CloseHandle(hProcess);
    
    return TRUE;
}
```

### 2. Steam API 调用

Steam Switch 需要调用 Steam API 来实现账号切换：

```c++
// 初始化 Steam API
bool InitSteamAPI() {
    if (!SteamAPI_Init()) {
        return false;
    }
    
    // 获取 Steam 用户
    ISteamUser* steamUser = SteamUser();
    if (steamUser == NULL) {
        return false;
    }
    
    return true;
}

// 切换账号
bool SwitchAccount(const char* username, const char* password) {
    // 登录 Steam
    SteamAPICall_t hSteamAPICall = SteamUser()->RequestEncryptedAppTicket(
        username, strlen(username));
    
    // 等待回调
    // ...
    
    return true;
}
```

### 3. 凭据管理

Steam Switch 需要安全地存储账号密码：

```c++
// 使用 Windows 凭据管理器存储密码
bool StoreCredentials(const char* target, const char* username, const char* password) {
    CREDENTIALW cred = {0};
    cred.Type = CRED_TYPE_GENERIC;
    cred.TargetName = (LPWSTR)target;
    cred.CredentialBlobSize = strlen(password);
    cred.CredentialBlob = (LPBYTE)password;
    cred.Persist = CRED_PERSIST_LOCAL_MACHINE;
    cred.UserName = (LPWSTR)username;
    
    return CredWriteW(&cred, 0);
}

// 读取凭据
bool ReadCredentials(const char* target, char* username, char* password) {
    CREDENTIALW* cred;
    if (!CredReadW((LPCWSTR)target, CRED_TYPE_GENERIC, 0, &cred)) {
        return false;
    }
    
    strcpy(username, (const char*)cred->UserName);
    strncpy(password, (const char*)cred->CredentialBlob, cred->CredentialBlobSize);
    
    CredFree(cred);
    return true;
}
```

### 4. 自动登录

Steam Switch 需要实现自动登录功能：

```c++
// 自动登录
bool AutoLogin(const char* username, const char* password) {
    // 启动 Steam
    STARTUPINFO si = {0};
    PROCESS_INFORMATION pi = {0};
    si.cb = sizeof(si);
    
    char cmdLine[MAX_PATH];
    sprintf(cmdLine, "\"%s\" -login %s %s", steamPath, username, password);
    
    if (!CreateProcess(NULL, cmdLine, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
        return false;
    }
    
    // 等待 Steam 启动
    WaitForSingleObject(pi.hProcess, INFINITE);
    
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    
    return true;
}
```

## 后续计划

### 第一阶段：基础功能

- [ ] 账号管理
- [ ] 快速切换
- [ ] 系统托盘

### 第二阶段：高级功能

- [ ] 任务栏集成
- [ ] Steam 库注入
- [ ] 自动登录

### 第三阶段：完善功能

- [ ] 皮肤主题
- [ ] 多语言支持
- [ ] 自动更新

## 总结

Steam Switch 是一个很有实用价值的工具，它可以大大简化 Steam 账号切换的流程。虽然实现起来有一些技术难点，但通过不断学习和实践，我相信可以完成这个项目。

如果你对这个项目感兴趣，欢迎关注和贡献。
