---
title: "使用 Hugo-Teek 改造 GitHub Pages 个人博客"
date: 2026-06-12T13:00:00+08:00
lastmod: 2026-06-12T13:00:00+08:00
description: "记录将原本简陋的 GitHub Pages 主页改造成技术博客的过程，包括主题选择、目录规划、自动部署和内容组织。"
categories:
  - 博客搭建
tags:
  - Hugo
  - Hugo-Teek
  - GitHub Pages
series:
  - 博客搭建
featured: true
draft: false
toc: true
weight: 1
---

## 为什么要改造个人博客

之前我的 GitHub Pages 主页只是一个简单的静态页面，内容很少，也没有博客功能。随着时间的推移，我意识到需要一个更好的平台来记录我的技术学习和项目实践。

### 原有主页的问题

1. **内容组织混乱**：没有分类和标签系统
2. **缺乏博客功能**：无法方便地发布和管理文章
3. **样式简陋**：只是一个简单的首页，没有技术博客的感觉
4. **维护困难**：每次更新都需要手动修改 HTML

### 改造目标

1. **使用静态博客框架**：方便发布和管理文章
2. **支持分类和标签**：让内容更有组织性
3. **美观的技术博客风格**：适合技术内容展示
4. **自动化部署**：推送到 GitHub 自动更新网站

## 为什么选择 Hugo-Teek

在选择博客框架时，我考虑了以下几个选项：

1. **Jekyll**：GitHub Pages 原生支持，但 Ruby 生态不太熟悉
2. **Hexo**：Node.js 生态，但主题选择有限
3. **Hugo**：Go 语言编写，速度快，主题丰富

最终选择 Hugo 的原因：

- **构建速度快**：Hugo 的构建速度比其他框架快很多
- **主题丰富**：有很多优秀的技术博客主题
- **Go 语言**：不需要额外的运行时环境
- **社区活跃**：文档完善，社区支持好

选择 Hugo-Teek 主题的原因：

- **适合技术博客**：专为技术内容设计
- **功能完善**：支持分类、标签、归档、搜索等功能
- **响应式设计**：支持移动端访问
- **暗色模式**：支持深色主题

## 目录结构设计

为了让博客内容更有组织性，我设计了以下目录结构：

```
content/
├── posts/           # 文章目录
│   ├── java/        # Java 后端
│   ├── springboot/  # Spring Boot
│   ├── database/    # 数据库
│   ├── ai-tools/    # AI 工具
│   ├── projects/    # 项目复盘
│   ├── interview/   # 面试总结
│   ├── blog/        # 博客搭建
│   └── notes/       # 学习笔记
├── about/           # 关于页面
├── links/           # 友链页面
└── now/             # 现在页面
```

这种结构的好处：

1. **清晰的分类**：每个目录对应一个技术方向
2. **易于扩展**：可以方便地添加新的分类
3. **便于管理**：文章和页面分开管理

## GitHub Actions 部署

为了让博客自动部署，我配置了 GitHub Actions：

```yaml
name: Deploy Hugo site to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: '0.150.0'
          extended: true

      - name: Build
        run: hugo --gc --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

这个配置的优点：

1. **自动触发**：推送到 main 分支自动构建
2. **手动触发**：支持手动触发构建
3. **使用最新版本**：使用 Hugo Extended 版本
4. **优化构建**：使用 `--gc --minify` 优化输出

## 后续计划

1. **完善内容**：添加更多技术文章
2. **优化样式**：根据需要调整主题样式
3. **添加功能**：考虑添加评论、统计等功能
4. **持续更新**：定期更新博客内容

## 总结

通过这次改造，我得到了一个功能完善、美观易用的技术博客。Hugo 和 Hugo-Teek 主题的组合非常适合技术博客，GitHub Actions 的自动部署也让维护变得简单。

如果你也在考虑搭建技术博客，推荐尝试 Hugo + Hugo-Teek 的组合。
